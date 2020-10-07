const fs = require('fs');
const path = require('path');
const axios = require('axios');
const imagesDir = './miro-images';

// Create images directory if 
// one doesn't already exist
if (!fs.existsSync(imagesDir)){
  fs.mkdirSync(imagesDir);
}

// const data = fs.readFileSync('affectedArticlesHiRez.json', 'utf8');
const data = fs.readFileSync('miroImages.json', 'utf8');
const articles = JSON.parse(data);

let imgUrls = articles.reduce((arr, article) => {
  const featImg = article.feature_image;
  const articleImgsArr = article.article_images;

  if (featImg && !arr.includes(featImg)) {
    arr.push(featImg);
  }
  
  if (articleImgsArr.length > 0) {
    articleImgsArr.forEach(url => arr.includes(url) ? arr : arr.push(url));
  }
  return arr;
}, []);
// console.log(imgUrls.length);

const downloadedImgs = fs.readdirSync(imagesDir, 'utf8');
// console.log(downloadedImgs.length);

async function downloadImg(url, filename) {
  const filePath = path.resolve(__dirname, imagesDir, filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function getFileName(url) {
  const cdnRegex = /https:\/\/cdn\-images\-1\.medium\.com\/max\/\d*\//;
  // const miroRegex = /https:\/\/miro\.medium\.com\/\d*\//;
  const miroRegex = /\d\*.*(?=\.\w{3,4}|\")(\.\w{3,4})?/

  // if (url.includes('https://cdn-images-1')) {
  //   return url.replace(cdnRegex, '');
  // } else {
  //   return url.replace(miroRegex, '');
  // }

  return url.match(miroRegex)[0];
}

async function downloadAllImgs(arr) {
  const delay = m => new Promise(resolve => setTimeout(resolve, m));

  for (let i = 0; i < arr.length; i++) {
    const currUrl = arr[i];
    const currFileName = getFileName(currUrl);

    // if (downloadedImgs.includes(currFileName)) {
    //   console.log(`${currUrl} skipped`);
    // } else {
    //   await downloadImg(currUrl, currFileName);
    //   console.log(`${currUrl} downloaded`);
    //   await delay(1000);
    // }

    await downloadImg(currUrl, currFileName);
    console.log(`${currUrl} downloaded`);
    await delay(500);
  }
}

downloadAllImgs(imgUrls);

// const allFileNames = imgUrls.map(url => {
//   return getFileName(url);
// });


// const missing = downloadedImgs.filter(file => {
//   return !allFileNames.includes(file);
// });

// console.log(missing);
// downloadAllImgs(missing);

// console.log(imgUrls.length, downloadedImgs.length);
