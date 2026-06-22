import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { chatRequestSchema, type ChatRequest } from '../schemas/index.js';
import { answerQuestion } from '../services/chatService.js';

export const chatRouter = Router();

chatRouter.post('/', validateBody(chatRequestSchema), (req, res) => {
  const body = req.body as ChatRequest;
  res.json(answerQuestion(body.message));
});
