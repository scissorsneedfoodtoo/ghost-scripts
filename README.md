# Ghost Scripts

## General Setup

- Run `cp sample.env .env`
- Set environment variables in the `.env` file

## Get All Posts

Within `get-all-posts.mjs`:

- Set the target language as `lang`
- Set the number of posts per request as `limit` – 15 is the default, and can go up to 100

Run the script with `node get-all-posts.mjs`

## Get Original Posts From Translations

Within `get-original-posts-from-translations.mjs`

- Add URLs for translated posts to the `translatedPostURLs` array

Run the script with `node get-original-posts-from-translations.mjs`

Note that this script will only write translated posts to `translated-posts.json` if an original post is found.
