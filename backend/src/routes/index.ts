import { Router } from 'express';
import { chatRouter } from './chat.js';
import { rightsRouter } from './rights.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/chat', chatRouter);
apiRouter.use('/rights', rightsRouter);
