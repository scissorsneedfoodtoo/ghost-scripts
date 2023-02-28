import GhostContentAPI from '@tryghost/content-api';
import { writeFileSync } from 'fs';
import { keys, delay } from './utils.mjs';

const lang = 'english';
const api = new GhostContentAPI({ ...keys[lang] });

const getAllPosts = async () => {
  let currPage = 1;
  let lastPage = 5;
  const limit = 15; // 15 is the default
  const allPosts = [];

  while (currPage && currPage <= lastPage) {
    try {
      const data = await api.posts.browse({
        include: ['tags', 'authors'],
        filter: 'status:published',
        page: currPage,
        limit
      });

      data.forEach(post => {
        allPosts.push(post);
      });

      lastPage = data.meta.pagination.pages;
      console.log(allPosts);
      console.log(`Page ${currPage} of ${lastPage}...`);
      currPage = data.meta.pagination.next;

      writeFileSync(
        `all-${lang}-posts.json`,
        JSON.stringify(allPosts, null, 2)
      );
      await delay(0.5);
    } catch (err) {
      console.log(`Error fetching page ${currPage} of ${lastPage}...`);
      console.log(err);
    }
  }
};

getAllPosts();
