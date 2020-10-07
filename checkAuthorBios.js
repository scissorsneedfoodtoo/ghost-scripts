require('dotenv').config();
const axios = require('axios');

const { EN_GHOST_CLIENT_KEY: GHOST_CLIENT_KEY } = process.env;
const delay = m => new Promise(resolve => setTimeout(resolve, m));

const getJson = async (url) => {
  return axios.get(url)
  .then(res => res.data )
  .catch(err => console.log(err));
}

const logMissingAuthorPages = async () => {
  const data = await getJson(`https://www.freecodecamp.org/news/ghost/api/v2/content/authors/?key=${GHOST_CLIENT_KEY}&limit=2000`);
  const authorUrls = data.authors.map(author => {
    return {
      name: author.name,
      url: author.url
    }
  }).sort((a, b) => a.name > b.name ? 1 : -1);

  for (let author of authorUrls) {
    axios.get(author.url)
      .then(res => {
        // console.log(`No error for ${author.name}`);
      })
      .catch(err => {
        console.log(`Error for ${author.name}'s page at ${author.url}.`);
      });

    await delay(250);
  }
}

logMissingAuthorPages();
