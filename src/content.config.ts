import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manufacturers = defineCollection({
  schema: z.object({
    id: z.string(),
    lang: z.string(),
    name: z.string(),
    logoImage: z.string(),
    website: z.string(),
    link: z.object({
      url: z.string(),
      target: z.string(),
    }),
    socials: z.array(z.object({
      label: z.string(),
      url: z.string(),
      icon: z.string(),
    })),
    description: z.array(z.string()).default([]),
    domains: z.array(z.string()).default([]),
  }),
  loader: glob({
    pattern: "**/*.json", base: "./src/content/manufacturers", generateId: ({ entry }) => {
      return entry;
    }
  }),
});

const categories = defineCollection({
  schema: z.object({
    id: z.string(),
    lang: z.string(),
    manufacturer: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  loader: glob({
    pattern: "**/*.json", base: "./src/content/categories", generateId: ({ entry }) => {
      return entry;
    }
  }),
});

const attributeSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

const attributeGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  properties: z.array(attributeSchema),
});

const variantSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

const extraValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products", generateId: ({ entry }) => {
    return entry;
  }}),
  schema: z.object({
    id: z.string(),
    lang: z.string(),
    url: z.string(),
    manufacturer: z.string(),
    category_slug: z.string(),
    category_name: z.string(),
    name: z.string(),
    name_short: z.string().default(""),
    slug: z.string(),
    model_name: z.string().default(""),
    lead: z.string().default(""),
    description: z.array(z.string()).default([]),
    attribute_groups: z.array(attributeGroupSchema).default([]),
    variants: z.array(variantSchema).default([]),
    extra_data: z.array(extraValueSchema).default([]),
    images: z.array(z.string()).default([]),
  }),
});

export const collections = { 
  manufacturers,
  products, 
  categories 
};