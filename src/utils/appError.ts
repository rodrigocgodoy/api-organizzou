export default class AppError extends Error {
  isOperational: boolean;

  constructor(public statusCode: number = 500, public message: string) {
    super(message);
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
