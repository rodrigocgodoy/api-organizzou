import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { LoginUserInput, RegisterUserInput } from '../schemas/user.schema';
import {
  createUser,
  excludedFields,
  findUniqueUser,
} from '../services/user.service';
import { Prisma } from '@prisma/client';
import AppError from '../utils/appError';
import { generateTokens } from '../utils/jwt';
import { omit } from 'lodash';
import { addRefreshTokenToWhitelist, deleteRefreshToken, findRefreshTokenById, revokeTokens } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { hashToken } from '../utils/hashToken';

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await createUser({
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      name: req.body.name,
    });

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    const newUser = omit(user, excludedFields);

    res.status(201).json({
      user: newUser,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          message: 'Email already exist, please use another email address',
        });
      }
    }
    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email.toLowerCase() },
      { id: true, email: true, password: true }
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError(400, 'Invalid email or password'));
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    const newUser = omit(user, excludedFields);

    res.status(200).json({
      user: newUser,
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers.refreshtoken as string;

    const message = 'Could not refresh access token';

    if (!refreshToken) {
      return next(new AppError(403, message));
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    // @ts-ignore
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUniqueUser({
      // @ts-ignore
      id: payload.userId,
    });

    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    next(err);
  }
};

export const revokeRefreshTokensHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
};
