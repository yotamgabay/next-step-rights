import { Router } from 'express';
import { amputationTypes, causeIds, quickIds, topics, type TopicId } from '../data/rights.js';

export const rightsRouter = Router();

function isTopicId(value: string): value is TopicId {
  return Object.prototype.hasOwnProperty.call(topics, value);
}

/** Full rights catalogue plus the cause/quick groupings used by the UI. */
rightsRouter.get('/topics', (_req, res) => {
  res.json({
    topics: Object.values(topics),
    causeIds,
    quickIds,
    amputationTypes,
  });
});

rightsRouter.get('/topics/:id', (req, res) => {
  const { id } = req.params;
  if (!isTopicId(id)) {
    res.status(404).json({ error: 'NotFound', message: `Unknown topic: ${id}` });
    return;
  }
  res.json(topics[id]);
});
