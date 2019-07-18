require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const getJson = async (url) => {
  return axios.get(url)
  .then(res => res.data )
  .catch(err => console.log(err));
}

const constructIndex = async () => {
  let currPage = 1;
  let lastPage = 5;
  const delay = m => new Promise(resolve => setTimeout(resolve, m));
  const posts = [];

  while (currPage && currPage <= lastPage) {
    const data = await getJson(`https://www.freecodecamp.org/news/ghost/api/v2/content/posts/?key=${process.env.GHOST_CLIENT_KEY}&include=tags,authors&page=${currPage}`);

    data.posts.forEach(post => {
      const thisPost = {
        title: post.title,
        author: {
          name: post.primary_author.name,
          url: post.primary_author.url,
          profile_image: post.primary_author.profile_image
        },
        tags: post.tags.map(obj => {
          return {
            name: obj.name,
            url: obj.url
          }
        }),
        url: post.url,
        feature_image: post.feature_image,
        ghost_id: post.id,
        published_at: post.published_at
      }

      posts.push(thisPost);
    });

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages; // uncomment to index all pages

    console.log(posts);

    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
    await delay(1000);
  }
}

constructIndex();
