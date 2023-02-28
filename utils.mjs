import * as dotenv from 'dotenv';
dotenv.config();

const keys = {
  english: {
    url: process.env.ENGLISH_GHOST_API_URL,
    key: process.env.ENGLISH_GHOST_CONTENT_API_KEY,
    version: process.env.ENGLISH_GHOST_API_VERSION
  },
  espanol: {
    url: process.env.ESPANOL_GHOST_API_URL,
    key: process.env.ESPANOL_GHOST_CONTENT_API_KEY,
    version: process.env.ESPANOL_GHOST_API_VERSION
  }
};

const pause = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

export { keys, pause };
