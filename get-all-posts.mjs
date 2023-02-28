import GhostContentAPI from '@tryghost/content-api';
import { writeFileSync } from 'fs';
import { keys, pause } from './utils.mjs';

const lang = 'english';
const langKeys = { ...keys[lang] };
const api = new GhostContentAPI({ ...langKeys });

const getAllPosts = async () => {
  let currPage = 1;
  let lastPage = 5;
  const limit = 15; // 15 is the default
  const allPosts = [];

  while (currPage && currPage <= lastPage) {
    const data = await api.posts.browse({
      include: ['tags', 'authors'],
      filter: 'status:published',
      page: currPage,
      limit
    });

    data.forEach((post) => {
      allPosts.push(post);
    });

    lastPage = data.meta.pagination.pages;
    console.log(allPosts);
    console.log(`Page ${currPage} of ${lastPage}...`);
    currPage = data.meta.pagination.next;

    writeFileSync('all-posts.json', JSON.stringify(allPosts, null, 2));
    await pause(.5);
  }
}

getAllPosts();
