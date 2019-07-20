const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dir = './images';

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

const data = fs.readFileSync('test.json', 'utf8');
const articles = JSON.parse(data);
const imgUrls = articles.reduce((arr, article) => {
  if (article.feature_image) {
    arr.push(article.feature_image);
  }

  if (article.article_images.length > 0) {
    article.article_images.forEach(url => arr.push(url));
  }
  return arr;
}, []);

async function downloadImage(url, filename) {  
  const filePath = path.resolve(__dirname, 'images', filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

function getFilename(url) {
  const regex = /https:\/\/cdn\-images\-1\.medium\.com\/max\/\d*\//;
  return url.replace(regex, '');
}

// imgUrls.forEach(url => {
//   downloadImage(url, getFilename(url));
// });
