import { Router } from 'express';
import { signupHandler } from '../handler/signup.handler';

const userrouter = Router();
userrouter.post('/signup', signupHandler);

export default userrouter;
