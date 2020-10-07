const getAllPosts = require('./mongoGetAllPosts.js');

async function fetchPosts() {
  const allPosts = await getAllPosts.constructIndex();

  console.log(allPosts)
}

test();