import fs from 'fs';
import kue from 'kue';
import { getenv } from "../util/environment";
import logger from "../logger";

const ALL_QUEUES = {};
ALL_QUEUES.get = (key) => {
    if(!ALL_QUEUES[key]){
        const queue =   kue.createQueue({
            prefix: key,
            redis: {
              port: getenv("QUEUE_PORT", 6379),
              host: getenv("QUEUE_HOST", "localhost"),
              auth: getenv("QUEUE_PASSWORD"),
              db: 3, // if provided select a non-default redis db
              options: {
                // see https://github.com/mranney/node_redis#rediscreateclient
              }
            }
        });

        //function for client to register handlers for processing
        queue.startProcessingTasks = function(tasks){
            tasks.forEach(({_key: key}) => {
                const {evaluator, progressTotal} = TASK_KEYS[key];
                queue.process(key, async (job, done) => {
                    try{
                        const ret = await evaluator(job.data, job);
                        logger.info(`JOB ${job.id} done`, ret);
                        job.progress(progressTotal, progressTotal, ret);
                        done();
                    }catch(e){
                        logger.error("ASYNC PROCESS ERROR");
                        logger.error(e);
                        done(e);
                    }
                })
            })
        }
        
        ALL_QUEUES[key] = queue;
    }
    return ALL_QUEUES[key];
}

export function getQueueClient(key){
    return ALL_QUEUES.get(key);
}

const TASK_KEYS = {};

export function loadTasksFromDirectory(DIR){
    const tasks = [];

    function parseTaskFile(FILE){
        try{
            tasks.push(require(FILE));
        }catch(err){
            logger.error(`ERROR LOADING TASK ${FILE}`)
            logger.error(err);
        }
    }

    const files = fs.readdirSync(DIR);
    files.forEach((file) => {
        //. or .. or blank filename
        if(!file.length || file[0] === '.')
            {return;}

        if(/\.js$/g.test(file)){    //file
            parseTaskFile(`${DIR}/${file}`)
        }else{  //dir
            parseTaskFile(`${DIR}/${file}/index.js`);
        }
    });
    return tasks;
}


/**
 * Create task promis
 */
export function enqueue(
    task, //async function of the task to be performed
    queue,
    payload = undefined, 
    {
        priority = 'normal',    // low, normal, medium, high, critial        
        progress = undefined    //callback for progress update
    } = { }
){
    return new Promise((resolve, reject) => {
        const queue_instance = ALL_QUEUES.get(queue);

        const job = queue_instance.create(task, payload)
                        .priority(priority)
                        .save( function(err){
                                    if( err ){
                                        reject(err);
                                    }else{
                                        logger.info(`SUCCESSFULLY CREATED JOB [${job.id}]`);
                                    }
                        });

        let retval = undefined;
        job.on('complete', function(result){
                logger.info(`Job [${job.id}] completed with data `, retval);
                resolve(retval);
            }).on('failed attempt', function(errorMessage, doneAttempts){
                logger.info(`Job [${job.id}] failed (attempt ${doneAttempts})`, errorMessage);
            }).on('failed', function(errorMessage){
                logger.info(`Job [${job.id}] failed `, errorMessage);
                logger.info(errorMessage);
                reject(errorMessage);
            }).on('progress', function(progressValue, data){
                logger.info('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
                if(data){
                    retval = data;
                }
                if(progress){
                    progress(progressValue, job, data);
                }            
            });
    });
}


export default function registerTask(node, task, evaluator, options = {}){
    const key = `${node}:${task}`;
    if(TASK_KEYS[key])
        {throw new Error(`Task with key (${key}) already exists`);}

    const defaultOptions = {
        progressTotal: 100
    }        

    TASK_KEYS[key] = {...defaultOptions, ...options, evaluator};

    const ret = (...args) => enqueue(key, node, ...args);
    ret._key = key;
    return ret;
}

