import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.get('/me', isAuthenticated, getMeHandler);

export default router;
