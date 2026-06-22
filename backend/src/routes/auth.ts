import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import {
  loginRequestSchema,
  signupRequestSchema,
  type LoginRequest,
  type SignupRequest,
} from '../schemas/index.js';
import { login, signup } from '../services/authService.js';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginRequestSchema), (req, res) => {
  res.json(login(req.body as LoginRequest));
});

authRouter.post('/signup', validateBody(signupRequestSchema), (req, res) => {
  res.status(201).json(signup(req.body as SignupRequest));
});
