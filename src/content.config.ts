import { publicEditionsPublished } from "./data/private-locales";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    category: z.string(),
    readTime: z.string(),
    accent: z.enum(["rose", "violet", "amber"]),
    answer: z.string(),
    keywords: z.array(z.string()),
    sources: z.array(z.object({ name: z.string(), url: z.string().url() })),
  }),
});

const draftJa = defineCollection({
  loader: publicEditionsPublished || (process.env.LOVESCAPE_PRIVATE_JA_PREVIEW === "local-only" && !process.env.CI && !process.env.CF_PAGES)
    ? glob({ pattern: ["*.md", "!README.md", "!SOURCES.md"], base: "./src/drafts/ja" })
    : { name: "private-ja-disabled", async load({ store }) { store.clear(); } },
  schema: z.object({
    route: z.string().startsWith("/ja/"),
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.literal("private-draft"),
    sources: z.array(z.string().url()).optional(),
  }),
});

const draftLocales = defineCollection({
  loader: publicEditionsPublished || (process.env.LOVESCAPE_PRIVATE_I18N_PREVIEW === "local-only" && !process.env.CI && !process.env.CF_PAGES)
    ? glob({ pattern: ["**/*.md", "!**/README.md", "!**/SOURCES.md", "!ja/**"], base: "./src/drafts" })
    : { name: "private-locales-disabled", async load({ store }) { store.clear(); } },
  schema: z.object({ locale: z.enum(["es", "zh-hant", "ko", "pt-br", "de", "fr", "ru", "ar"]), route: z.string().regex(/^\/(?:es|zh-hant|ko|pt-br|de|fr|ru|ar)\//), title: z.string().min(1), description: z.string().min(1), status: z.literal("private-draft") }),
});

export const collections = { blog, draftJa, draftLocales };
