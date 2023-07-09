import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { db } from '../utils/db';

export const excludedFields = ['password', 'verified', 'verificationCode'];

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await db.user.create({
    data: input,
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await db.user.findUnique({
    where,
    select,
  })) as User;
};
