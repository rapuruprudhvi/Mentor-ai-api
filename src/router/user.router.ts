import { Router } from 'express';
import { signupHandler } from '../handler/signup.handler';
import { signinHandler } from '../handler/signin.handler';


const userrouter = Router();
userrouter.post('/signup', signupHandler);
userrouter.post('/signin', signinHandler);


export default userrouter;
