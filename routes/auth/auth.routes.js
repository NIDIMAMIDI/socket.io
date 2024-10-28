import { Router } from 'express';
import { loginUser, registerUser } from '../../controllers/auth/auth.controllers.js';
import { registrationValidation } from '../../utils/validation/register.validation.js';
import { loginValidation } from '../../utils/validation/login.validation.js';
const authRouter = Router();

authRouter.post('/register', registrationValidation, registerUser);

authRouter.post('/login', loginValidation, loginUser);

export default authRouter;
