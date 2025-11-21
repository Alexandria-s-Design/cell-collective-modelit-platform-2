'use strict';
import { createAttributes } from "../db/mixins/attributes";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks', {
			id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
			//Should store a group of tasks
			job: {
        type: Sequelize.STRING(15),
      },
      name: {
        type: Sequelize.STRING(60),
      },
      description: {
        type: Sequelize.STRING(500),
      },
			processId: {
        type: Sequelize.INTEGER,
      },
			progress: {
        type: Sequelize.SMALLINT,
      },
			//LOADING, DONE, WAITING
			state: {
				type: Sequelize.STRING(8),
			},
			startedAt: {
        type: Sequelize.DATE,
      },
			finishedAt: {
        type: Sequelize.DATE,
      },
			prevRun: {
        type: Sequelize.DATE,
      },
			nextRun: {
        type: Sequelize.DATE,
      },
			//Store milliseconds between the next run
			sleep: {
        type: Sequelize.BIGINT,
      },
			//10000000: where 0 is not execute and 1 is execute in this day
			//Example: Run every Tuesday and Thursday equals 10010100
			daysRun: {
        type: Sequelize.INTEGER,
      },						
			//Number identifying what is more important task should be executed at the same time
			priority: {
        type: Sequelize.SMALLINT,
      },
			failureMessage: {
        type: Sequelize.TEXT,
      },
			files: {
        type: Sequelize.TEXT,
      },
			executedBy: {
        type: Sequelize.BIGINT,
      },
			resultLogPath: {
        type: Sequelize.STRING(300),
      },
			resultData: {
        type: Sequelize.TEXT,
      },
			resultDataType: {
        type: Sequelize.STRING(15),
      },
			...createAttributes(Sequelize)
    });

		await queryInterface.sequelize.query(`
			CREATE INDEX tasks_job_btree_idx
			ON public."Tasks"
			USING btree("job");

			CREATE INDEX tasks_state_btree_idx
			ON public."Tasks"
			USING btree("state");
		`);

	},

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tasks');
  }
};
