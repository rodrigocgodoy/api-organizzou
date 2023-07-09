import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.headers);
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error('🚫 Un-Authorized 🚫');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    // @ts-ignore
    req.payload = payload;
  } catch (err: any) {
    res.status(401);

    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    
    throw new Error('🚫 Un-Authorized 🚫');
  }

  return next();
};
