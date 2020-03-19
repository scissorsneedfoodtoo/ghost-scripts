const path = require('path');

const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

const { GHOST_CLIENT_KEY } = process.env;

const axios = require('axios');
const fs = require('fs');

const getJson = async (url) => {
  return axios.get(url)
  .then(res => res.data )
  .catch(err => console.log(err));
}

const dasherize = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s/g, '-')
    .replace(/[^a-z\d\-.]/g, '');
}

const constructIndex = async () => {
  let currPage = 1;
  let lastPage = 5;
  const delay = m => new Promise(resolve => setTimeout(resolve, m));
  const posts = [];

  while (currPage && currPage <= lastPage) {
    const data = await getJson(`https://www.freecodecamp.org/news/ghost/api/v2/content/posts/?key=${GHOST_CLIENT_KEY}&include=tags,authors&page=${currPage}`);

    data.posts.forEach(post => {
      const currProfileImg = post.primary_author.profile_image;
      const profileImageUrl = (currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')) ? `https:${currProfileImg}` : currProfileImg;

      const thisPost = {
        title: post.title,
        author: {
          name: post.primary_author.name,
          url: post.primary_author.url,
          profileImage: profileImageUrl
        },
        tags: post.tags.map(obj => {
          return {
            name: obj.name,
            url: obj.url.includes('404') ? `https://www.freecodecamp.org/news/tag/${dasherize(obj.name)}/` : obj.url // occasionally gets a 404 -- maybe if there's only one article with this tag?
          }
        }),
        url: post.url,
        featureImage: post.feature_image,
        ghostId: post.id,
        publishedAt: post.published_at,
        publishedAtTimestamp: new Date(post.published_at).getTime() / 1000 | 0
      }

      posts.push(thisPost);
    });

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages; // uncomment to index all pages

    console.log(posts);

    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
    await delay(500);
  }
}

constructIndex();
