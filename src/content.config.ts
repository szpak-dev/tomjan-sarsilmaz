import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
    id: z.string(),
    catalogNumber: z.string(),
    active: z.boolean(),
    featured: z.boolean().optional().default(false),
    name: z.string(),
    shortName: z.string(),
    color: z.string().optional(),
    lead: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()),
    specification: z.array(
      z.object({
        name: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    ),
    features: z.array(
      z.object({
        category: z.string(),
        parameters: z.array(
          z.union([
            z.string(),
            z.array(z.string()),
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          ])
        ),
      })
    ),
  }),
});

export const collections = { products };
