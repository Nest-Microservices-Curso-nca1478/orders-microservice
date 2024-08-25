import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  HOST: string;
  RETRYATTEMPTS: number;
  RETRYDELAY: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    HOST: joi.string().required(),
    RETRYATTEMPTS: joi.number(),
    RETRYDELAY: joi.number(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  host: envVars.HOST,
  retryAttempts: envVars.RETRYATTEMPTS,
  retryDelay: envVars.RETRYDELAY,
};
