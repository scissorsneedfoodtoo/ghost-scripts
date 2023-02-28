import GhostContentAPI from '@tryghost/content-api';
import { writeFileSync } from 'fs';
import { keys, pause } from './utils.mjs';

const translationLang = 'espanol';
const originalLang = 'english';
const translationAPI = new GhostContentAPI({ ...keys[translationLang] });
const originalAPI = new GhostContentAPI({ ...keys[originalLang] });
const translatedPostSlugs = [
  'que-es-una-cadena-de-caracteres-string-en-javascript',
  'cual-es-la-direccion-ip-de-mi-router-como-encontrar-mi-direccion-wifi',
  'como-obtener-la-direccion-ip-de-un-contenedor-docker-explicado-con-ejemplos'
];

const getPostsBySlug = async () => {
  const translatedPosts = [];
  const originalPosts = [];

  for (const translatedPostSlug of translatedPostSlugs) {
    const translatedPost = await translationAPI.posts.read({
      include: ['tags', 'authors'],
      filter: 'status:published',
      slug: translatedPostSlug
    });

    console.log(`Fetched translated post with slug: ${translatedPostSlug}...`);
    translatedPosts.push(translatedPost);
    await pause(0.1);
  }

  for (const translatedPost of translatedPosts) {
    const headAndFootCode = [
      translatedPost.codeinjection_head,
      translatedPost.codeinjection_foot
    ]
      .filter(Boolean)
      .join();
    const originalPostRegex =
      /const\s+fCCOriginalPost\s+=\s+("|')(?<url>.*)\1;?/gi;
    const match = originalPostRegex.exec(headAndFootCode);
    const { pathname } = new URL(match.groups.url);
    const pathSegments = pathname.split('/').filter(str => str);
    const originalPostSlug = pathSegments[pathSegments.length - 1];
    const originalPost = await originalAPI.posts.read({
      include: ['tags', 'authors'],
      filter: 'status:published',
      slug: originalPostSlug
    });

    console.log(`Fetched original post with slug: ${originalPostSlug}...`);
    originalPosts.push(originalPost);
    await pause(0.1);
  }

  console.log(`Writing files...`);
  writeFileSync(
    'translated-posts.json',
    JSON.stringify(translatedPosts, null, 2)
  );
  writeFileSync('original-posts.json', JSON.stringify(originalPosts, null, 2));
};

getPostsBySlug();
