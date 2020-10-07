const path = require('path');
const axios = require('axios');
const assert = require('assert');
const crypto = require('crypto');
const mongoose = require('mongoose');

const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

const { PRD_GHOST_CLIENT_KEY, MONGO_ATLAS_PASSWORD } = process.env;

const delay = m => new Promise(resolve => setTimeout(resolve, m));

async function getJson(url) {
  return axios.get(url)
  .then(res => res.data )
  .catch(err => console.log(err));
}

async function constructIndex() {
  let currPage = 1;
  let lastPage = 3;
  const posts = [];

  while (currPage && currPage <= lastPage) {
    // const data = await getJson(`https://www.freecodecamp.org/news/ghost/api/v2/content/posts/?key=${PRD_GHOST_CLIENT_KEY}&include=tags,authors&page=${currPage}`);
    const data = await getJson(`http://localhost:2368/ghost/api/v2/content/posts/?key=0535875f1f205444d2b4c1bf90&include=tags,authors&page=${currPage}`);

    data.posts.forEach(post => {
      const thisPost = {
        title: post.title,
        author: {
          name: post.primary_author.name,
          url: post.primary_author.url,
          profileImage: post.primary_author.profile_image
        },
        tags: post.tags.map(obj => {
          return {
            name: obj.name,
            url: obj.url
          }
        }),
        url: post.url,
        featureImage: post.feature_image,
        ghostId: post.id,
        publishedAt: post.published_at
      }

      posts.push(thisPost);
    });

    currPage = data.meta.pagination.next;
    // lastPage = data.meta.pagination.pages; // uncomment to index all pages

    // console.log(posts);

    await delay(300);
  }

  return posts;
}

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ghostId: String,
  title: String,
  tags: Array,
  author: Object,
  // hash: { type: String, index: 'hashed' }
  hash: Object
});

const Post = mongoose.model('Post', postSchema);

async function saveToDb() {
  const uri = `mongodb+srv://dbUser:${MONGO_ATLAS_PASSWORD}@algolia-hashes-sigsi.mongodb.net/test?retryWrites=true&w=majority`;

  mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });

  // let data = JSON.stringify(ghostPosts[0]);
  // let buff = Buffer.from(data);
  // let currPostHash = buff.toString('base64');

  // const currPost = new Post({
  //   // _id: new mongoose.Types.ObjectId(),
  //   ghostId: allPosts[0].ghostId,
  //   title: allPosts[0].title,
  //   tags: allPosts[0].tags,
  //   author: allPosts[0].author,
  //   hash: currPostHash
  // });

  // const currPost = {
  //   // _id: new mongoose.Types.ObjectId(),
  //   ghostId: allPosts[0].ghostId,
  //   title: allPosts[0].title,
  //   tags: allPosts[0].tags,
  //   author: allPosts[0].author,
  //   hash: currPostHash
  // };

  const ghostPosts = await constructIndex();
  const mongoPosts = await Post.find({});
  const ghostMap = ghostPosts.reduce((map, post) => {
    map[post.ghostId] = post;
    return map;
  }, {});
  const mongoMap = mongoPosts.reduce((map, post) => {
    map[post.ghostId] = post;
    return map;
  },{});
  // Posts that exist in the db but not on Ghost
  // const toBeDeleted = Object.keys(mongoMap).filter(key => !ghostMap[key]).map(key => mongoMap[key]);
  const toDelete = Object.keys(mongoMap).reduce((arr, key) => {
    if (!ghostMap[key]) arr.push(mongoMap[key]);
    return arr;
  }, []);
  // Posts that exist on Ghost but not on the db
  const toAdd = [];
  // Posts that exist on Ghost and the db, but are different
  const toUpdate = [];
  

  console.log(toBeDeleted)


  // await Post.insertMany(allPosts)
  //   .then(res => console.log(res))
  //   .catch(err => console.log(err));


  // await Post.findOneAndUpdate(
  //   { ghostId: currPost.ghostId }, // find a document with this filter
  //   { $setOnInsert: currPost },    // document to insert when nothing was found
  //   { upsert: true, new: true, runValidators: true }
  // )
  //   .then(doc => console.log(doc))
  //   .catch(err => console.log(err));

  mongoose.connection.close();
}

saveToDb();

// function diffArray(arr1, arr2) {
//   return arr1
//     .filter(obj => {
//       const currId = obj.ghostId;
//       const arr2Ids = arr2.map(obj => obj.ghostId);
//       return !arr2Ids.includes(currId);
//     })
//     .concat(
//       arr2.filter(obj => {
//         const currId = obj.ghostId;
//         const arr1Ids = arr1.map(obj => obj.ghostId);
//         return !arr1Ids.includes(currId);
//       })
//     )
// }
