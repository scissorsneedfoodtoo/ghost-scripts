require('dotenv').config();

// const tags = require('./cnTagsTest.json');
const tags = require('./cnTags.json');
const GhostAdminAPI = require('@tryghost/admin-api');

const api = new GhostAdminAPI({
  url: 'https://chinese.freecodecamp.org/news',
  // Admin API key goes here
  key: process.env.CN_GHOST_ADMIN_KEY,
  version: 'v2'
});

const delay = m => new Promise(resolve => setTimeout(resolve, m));

const addAllTags = async () => {
  for (let i in tags) {
    const tag = tags[i];
    
    console.log(tag);

    api.tags.add(tag)
      .then(res => res)
      .catch(err => console.error(err));

    await delay(500);
  }
}

addAllTags();
