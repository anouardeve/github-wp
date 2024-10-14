// https://astro.build/config
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { remarkReadingTime } from "./src/utils/all";
import config from "./src/config/config.json";

// Get WordPress redirects
import { loadEnv } from "vite";
const { WP_USERNAME, WP_APPLICATION_PASSWORD } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  "",
);

let redirects = {};

if (WP_USERNAME && WP_APPLICATION_PASSWORD) {
  const response = await fetch(
    `${config.API_URL}/wp-json/redirection/v1/redirect`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${WP_USERNAME}:${WP_APPLICATION_PASSWORD}`).toString(
            "base64",
          ),
      },
    },
  );
  const data = await response.json();

  for (const redirect of data.items) {
    redirects[redirect.url] = redirect.action_data.url;
  }
}

export default defineConfig({
  site: config.site.url,
  redirects,
  trailingSlash: "always",
  image: {
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "cloudinary.com",
      "res.cloudinary.com",
      "secure.gravatar.com",
    ],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    icon({
      include: {
        lucide: ["moon", "sun-medium", "image"],
        tabler: [
          "brand-x",
          "brand-facebook",
          "brand-linkedin",
          "brand-pinterest",
        ],
        uil: ["map-marker", "envelope", "phone"],
      },
    }),
    sitemap(),
  ],
});
