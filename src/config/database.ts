import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { entities } from "../entity"; 
import { migrations } from '../migrations';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'kiran8008',
  database: process.env.DB_DATABASE || 'mentor_ai',
  synchronize: false,
  logging: false,
  entities, 
  migrations,
});
