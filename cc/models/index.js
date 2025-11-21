import Sequelize  from "sequelize";

import { getenv } from "../util/environment";
import DataBase   from "../db";

const db = new DataBase(getenv("DATABASE_NAME"));
db.connect();

const models     = db.models;

models.sequelize = db.sequelize;
models.Sequelize = Sequelize;

models.connect      = async ({ sync = false } = { }) => {
	await db.connect({ sync });
}

export { db };
export default models;