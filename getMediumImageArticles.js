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
      // Ex: https://cdn-images-1.medium.com/max/800/1*uSfRm31oD_2bgNgYt-Hfaw.gif and
      // https://cdn-images-1.medium.com/max/1200/0*Ga1fGBrxkoKgfzbu
      const regex = /https:\/\/cdn\-images\-1\.medium\.com\/max\/\d*\/.+?(?=\.\w{3,4}|\")(\.\w{3,4})?/g;
      let mediumFeatureImg;
      let mediumArticleImgs;

      // Account for articles without feature images or posts
      if (post.feature_image) {
        mediumFeatureImg = post.feature_image.includes('https://cdn-images-1.medium.com') ? post.feature_image : '';
      }

      if (post.html) {
        mediumArticleImgs = post.html.includes('https://cdn-images-1.medium.com') ? post.html.match(regex) : [];
      }

      if (mediumFeatureImg || mediumArticleImgs.length > 0) {
        const thisPost = {
          feature_image: mediumFeatureImg,
          article_images: mediumArticleImgs, 
          ghost_id: post.id,
          slug: post.slug
        }
  
        posts.push(thisPost);
      }
    });

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages; // uncomment to index all pages

    console.log(posts);

    fs.writeFileSync('test.json', JSON.stringify(posts, null, 2));
    await delay(500);
  }
}

constructIndex();
