import express, { Application, Request, Response } from 'express';
import userrouter from './router/user.router';

export const createApp = (): Application => {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', userrouter);


  app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API is running' });
  });

  return app;
};
