import { defineCollection, z } from "astro:content"

const books = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleTh: z.string(),
    description: z.string(),
    author: z.string(),
    date: z.string(),
    pdfUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = { books }
