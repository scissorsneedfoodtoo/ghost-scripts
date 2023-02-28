import GhostContentAPI from '@tryghost/content-api';
import { writeFileSync } from 'fs';
import { keys, pause } from './utils.mjs';

const translatedPostURLs = [
  'https://www.freecodecamp.org/espanol/news/aprende-git-y-github-curso-desde-cero/', // No translation – should not appear in original or translated files
  'https://www.freecodecamp.org/espanol/news/que-es-una-cadena-de-caracteres-string-en-javascript',
  'https://www.freecodecamp.org/espanol/news/cual-es-la-direccion-ip-de-mi-router-como-encontrar-mi-direccion-wifi'
];

const getPostByURL = async url => {
  const { pathname } = new URL(url);
  const pathSegments = pathname.split('/').filter(str => str);
  const slug = pathSegments[pathSegments.length - 1];
  const lang = pathSegments[0] === 'news' ? 'english' : pathSegments[0];
  const api = new GhostContentAPI({ ...keys[lang] });

  try {
    const post = await api.posts.read({
      include: ['tags', 'authors'],
      filter: 'status:published',
      slug
    });

    console.log(`Fetched post: ${post.title}`);
    await pause(0.2);
    return post;
  } catch (err) {
    console.log(`Error fetching post: ${url}`);
    console.log(err);
  }
};

const getOriginalPostsFromTranslations = async () => {
  const originalPosts = [];
  const translatedPosts = [];

  for (const translatedPostURL of translatedPostURLs) {
    const post = await getPostByURL(translatedPostURL);

    // Check if the current post is a translation
    const headAndFootCode = [post.codeinjection_head, post.codeinjection_foot]
      .filter(Boolean)
      .join();
    const originalPostRegex =
      /const\s+fCCOriginalPost\s+=\s+("|')(?<originalPostURL>.*)\1;?/gi;
    const match = originalPostRegex.exec(headAndFootCode);

    if (match) {
      const originalPost = await getPostByURL(match.groups.originalPostURL);
      originalPosts.push(originalPost);
      translatedPosts.push(post);
    } else {
      console.log(`No original post found for ${post.title}... Skipping...`);
    }
  }

  // Write translated posts and their original posts to separate files
  console.log('Writing files...');
  writeFileSync('original-posts.json', JSON.stringify(originalPosts, null, 2));
  writeFileSync(
    'translated-posts.json',
    JSON.stringify(translatedPosts, null, 2)
  );
};

getOriginalPostsFromTranslations();
