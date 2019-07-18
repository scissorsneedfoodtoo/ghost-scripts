require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Ghost setup
const adminKey = process.env.GHOST_ADMIN_KEY;
const [id, secret] = adminKey.split(':');
const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
  keyid: id,
  algorithm: 'HS256',
  expiresIn: '5m',
  audience: `/v2/admin/`
});
const headers = { Authorization: `Ghost ${token}` };

// Import array of URLs/slugs to be deleted
const toDelete = require('./toDelete.js').posts;

const getSlug = str => str.includes('http://localhost:2368') ? str.replace('http://localhost:2368', '') : str;

const getPost = url => {
  return axios.get(url, { headers })
  .then(res => res.data )
}

const deletePost = id => {
  return axios.delete(id, { headers })
  .then(res => res.data )
}

const baseApiUrl = 'http://localhost:2368/ghost/api/v2/admin';

const getPostIds = async (arr) => {
  return await Promise.all(arr.map(async (url) => {
    const slug = getSlug(url);
    const apiCall = `${baseApiUrl}/posts/slug${slug}`;

    try {
      const res = await getPost(apiCall);

      return res.posts[0].id;
    } catch(err) {
      console.log(`Couldn't find ${slug} due to "${(err)}". Was it already deleted?`)
    }
  }));
}

const deleteAllPosts = async () => {
  const ids = await getPostIds(toDelete);
  await Promise.all(ids.map(async (id, index) => {
    const apiCall = `${baseApiUrl}/posts/${id}`;

    try {
      await deletePost(apiCall);

      console.log(`Successfully deleted ${toDelete[index]}`); 
    } catch(err) {
      // Error already logged in getPostIds()
    }
  }));

  console.log("Finished!");
}

deleteAllPosts();
