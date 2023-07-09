import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { excludedFields, findUniqueUser } from '../services/user.service';

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const { userId } = req.payload;

    const user = await findUniqueUser(
      { id: userId }
    );

    const newUser = omit(user, excludedFields);

    res.status(200).status(200).json({
      user: newUser,
    });
  } catch (err: any) {
    next(err);
  }
};