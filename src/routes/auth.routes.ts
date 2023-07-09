import express from 'express';
import {
  loginUserHandler,
  refreshTokenHandler,
  registerUserHandler,
  revokeRefreshTokensHandler,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginUserSchema, registerUserSchema } from '../schemas/user.schema';

const router = express.Router();

router.post('/register', validate(registerUserSchema), registerUserHandler);

router.post('/login', validate(loginUserSchema), loginUserHandler);

router.get('/refreshToken', refreshTokenHandler);

router.post('/revokeRefreshTokens', revokeRefreshTokensHandler);

export default router;