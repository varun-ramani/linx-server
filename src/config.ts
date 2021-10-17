import dotenv from 'dotenv';

const config = dotenv.config().parsed;

export const PORT: number = parseInt(config?.PORT as string, 10);
export const UPLOAD_ROOT: string = config?.UPLOAD_ROOT;
export const HOSTNAME: string = config?.HOSTNAME;
export const BASE: string = `${HOSTNAME}:${PORT}`;