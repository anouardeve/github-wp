import config from "@config/config.json";

const refetch = (url, options = {}, retries) =>
  fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      if (retries > 0) {
        return refetch(url, options, retries - 1);
      }
      throw new Error(res.status);
    })
    .catch((error) => console.error(error.message));

export async function getAllAuthors(posts) {
  // Build a list of all authors
  const list = [];
  posts.map((post) => list.push(post.author.node));
  const authorsList = Array.from(new Set(list.map((a) => a.slug))).map(
    (slug) => {
      return list.find((a) => a.slug === slug);
    },
  );

  // Get all authors from Co-Authors Plus
  const authors = {};
  await Promise.all(
    authorsList.map(async (author) => {
      authors[author.slug] = await refetch(
        `${config.API_URL}/wp-json/coauthors/v1/coauthors/${author.slug}`,
        {},
        2,
      );
    }),
  );

  return authors;
}

export async function getAllAuthorsOld(wp_username, wp_application_password) {
  const response = await fetch(
    `${config.API_URL}/wp-json/coauthors/v1/search`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${wp_username}:${wp_application_password}`).toString(
            "base64",
          ),
      },
    },
  );

  const data = await response.json();

  return data;
}
