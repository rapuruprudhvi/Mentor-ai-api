import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { entities } from "../entity";
import { migrations } from "../migrations";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,

  entities,
  migrations,
});
