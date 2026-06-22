import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { chatRequestSchema, type ChatRequest } from '../schemas/index.js';
import { askChatbot } from '../services/chatbotService.js';

export const chatRouter = Router();

chatRouter.post('/', validateBody(chatRequestSchema), async (req, res, next) => {
  try {
    const { message, profile } = req.body as ChatRequest;
    const result = await askChatbot(profile, message);
    res.json(result);
  } catch (err) {
    console.dir(err, { depth: null })
    next(err);
  }
});
