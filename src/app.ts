import * as dotenv from 'dotenv';
dotenv.config();
import express, { NextFunction, Request, Response, response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import validateEnv from './utils/validateEnv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import AppError from './utils/appError';
import swaggerUi from "swagger-ui-express";
import morgan from 'morgan';
import swaggerJSDoc from "swagger-jsdoc";

validateEnv();

const prisma = new PrismaClient();
const app = express();

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentation API Organizzou",
      version: "1.0.0",
    },
    schemes: ["http", "https"],
    servers: [{ url: "http://localhost:8000/" }],
  },
  apis: [
    `${__dirname}/routes/auth.routes.ts`,
    `${__dirname}/routes/user.routes.ts`,
    "./dist/routes/auth.routes.js",
    "./dist/routes/user.routes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

async function bootstrap() {
  app.set('view engine', 'pug');
  app.set('views', `${__dirname}/views`);

  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("tiny"));
  app.use(express.static("public"));
  app.use(cors());

  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/healthchecker', async (_, res: Response) => {
    res.status(200).json({
      message: 'Welcome to NodeJs with Prisma and PostgreSQL',
    });
  });
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, `Route ${req.originalUrl} not found`));
  });

  app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
      message: err.message,
    });
  });

  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
}

bootstrap()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });