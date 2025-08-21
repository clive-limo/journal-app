require('dotenv').config();

const { PORT: port } = process.env;

if (typeof port !== 'string') throw new Error('Missing PORT in .env');
export const PORT = port;
