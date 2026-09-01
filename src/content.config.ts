import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";


const archive = defineCollection({
  loader: glob({
    base: "./src/content/archive",
    pattern: "**/*.md",
  }),

  schema: z.object({
    accession: z.string().optional(),

    title: z.string(),
    dateFound: z.coerce.date(),
    originalDate: z.string().optional(),
    creator: z.string().optional(),

image: z.string(),
alt: z.string().optional(),

gallery: z.array(
  z.object({
    image: z.string(),
    caption: z.string().optional(),
    credit: z.string().optional(),
    sourceUrl: z.string().optional(),
  })
).default([]),

colors: z.array(z.string()).default([]),

archiveDescription: z.string().optional(),

location: z.string().optional(),
country: z.string().optional(),
region: z.string().optional(),
city: z.string().optional(),
neighborhood: z.string().optional(),
venue: z.string().optional(),

kind: z.string().optional(),
reason: z.string().optional(),

    collections: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),

sourceName: z.string().optional(),
sourceUrl: z.string().optional(),

attachments: z.array(
  z.object({
    file: z.string(),
    title: z.string(),
  })
).default([]),

featured: z.boolean().default(false),
    favorite: z.boolean().default(false),
    private: z.boolean().default(false),
  }),
});


const notes = defineCollection({
  loader: glob({
    base: "./src/content/notes",
    pattern: "**/*.md",
  }),

  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),

    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),

    featured: z.boolean().default(false),
  }),
});


const curatedCollections = defineCollection({
  loader: glob({
    base: "./src/content/collections",
    pattern: "**/*.md",
  }),

  schema: z.object({
    title: z.string(),
    description: z.string().optional(),

    coverImage: z.string().optional(),

    order: z.number().optional(),
    featured: z.boolean().default(false),
  }),
});


export const collections = {
  archive,
  notes,
  collections: curatedCollections,
};