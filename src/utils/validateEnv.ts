import { cleanEnv, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    PORT: port(),
    NODE_ENV: str(),

    POSTGRES_HOST: str(),
    POSTGRES_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),

    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),

    NODEMAILER_EMAIL: str(),
    NODEMAILER_PASSWORD: str(),

    DATABASE_URL: str(),
  });
}

export default validateEnv;