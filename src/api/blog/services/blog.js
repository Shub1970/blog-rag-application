"use strict";

/**
 * blog service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const { OpenAI } = require("openai");

const { Client } = require("pg");

// Initialize PostgreSQL Client
const pgClient = new Client({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});
pgClient.connect();

// Utility to remove HTML tags from content
const stripHtml = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

module.exports = createCoreService("api::blog.blog", ({ strapi }) => ({
  async generateEmbedding(blog) {
    try {
      const {
        documentId,
        title,
        content,
        short_content,
        blog_category,
        Blog_author,
      } = blog;

      const cleanContent = stripHtml(content);

      const text = `
        Title: ${title}
        Author: ${Blog_author || "Unknown"}
        Category: ${blog_category || "Uncategorized"}
        Summary: ${short_content}
        Content: ${cleanContent}
      `.trim();

      // Get OpenAI embeddings
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
        input: text,
        model: "text-embedding-3-small",
      });

      const embeddingVector = response.data[0].embedding;

      // Store embeddings in PostgreSQL
      await pgClient.query(
        `INSERT INTO blog_embedding_oai_small (documentId,embedding,content)
         VALUES ($1, $2::vector, $3)
         ON CONFLICT (documentId) DO UPDATE SET embedding = EXCLUDED.embedding`,
        [documentId, JSON.stringify(embeddingVector), text]
      );

      strapi.log.info(`✅ Embedding created for Blog ID: ${documentId}`);
    } catch (error) {
      strapi.log.error(
        `❌ Error creating embedding for Blog ID: ${blog.documentId}:`,
        error
      );
    }
  },
}));
