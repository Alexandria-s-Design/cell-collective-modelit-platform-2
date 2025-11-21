/***** Entry point for computation node dispatchTask script */

function printHelp() {
    console.log(```
        Run task in the background

        Usage:
        dispatchTask :<TASK> [<ARGUMENTS>]
        dispatchTask <NODE>:<TASK> [<ARGUMENTS>]
        dispatchTask -h|--help
      
        Options:
            TASK             Specify the task to be evaluated

            NODE             Specify the background execution node 
                                        (default: computational)

            OPTIONS       Optional JSON arguments to be passed to the task

        example:
                dispatchTask ping
                dispatchTask computational:ping
                dispatchTask computational:ping "{data:1}"
    ```);
}


if(/-{0,2}h(elp)?/.test(process.argv[2])){
    printHelp();
    process.exit(0);
}



const [TASK_URL1, TASK_URL2] = (process.argv[2]||"").split(":");
let TASK, NODE;
if(TASK_URL2){
    TASK = TASK_URL2;
    NODE = TASK_URL1;
}else{
    TASK = TASK_URL1;
    NODE = "computational";
}
const OPTIONS = JSON.parse(process.argv[3]||"{}");

const URL = `./${NODE}/tasks/${TASK}.js`;

console.log(`LOADING >>${URL}<<`);
const task_fun = require(URL);

(async () => {
    console.log(`DISPATCHING TASK >>${NODE}:${TASK}<<`);
    console.log("OPTIONS: ", OPTIONS);

    console.log("waiting for queue to result");
    const data = await task_fun();
    console.log("SUCCESSFULLY RETURNED");
    console.log(data);
    process.exit(0);
})();