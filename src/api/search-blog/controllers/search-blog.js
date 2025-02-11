// ./src/api/search-blog/controllers/search-blog.js
"use strict";
const { OpenAI } = require("openai");

module.exports = {
  async findSimilar(ctx) {
    // Existing findSimilar method
    try {
      const { query } = ctx.request.body;

      if (!query) {
        return ctx.badRequest("Missing 'query' in request body.");
      }

      if (query.length < 3) {
        return ctx.badRequest("Query must be at least 3 characters long.");
      }
      console.log("Query:", query);

      // Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Generate the embedding for the input query
      const response = await openai.embeddings.create({
        input: query,
        model: "text-embedding-3-small",
      });

      const queryEmbedding = response.data[0].embedding;
      const vectorString = `[${queryEmbedding.join(",")}]`;

      // Get the database connection from Strapi
      const db = strapi.db.connection;

      // Query PostgreSQL using cosine similarity search, limit to 2 results
      const { rows } = await strapi.db.connection.raw(
        `
        SELECT documentid, content,embedding <=> ?::vector AS similarity
        FROM blog_embedding_oai_small
        ORDER BY similarity ASC
        LIMIT 2;
      `,
        [vectorString]
      );

      // Extract the context from the search results
      const context = rows.map((row) => ({
        documentid: row.documentid,
        content: row.content,
        similarity: row.similarity,
      }));

      return ctx.send({
        message: "Similar blogs found",
        results: context,
      });
    } catch (error) {
      console.error("Error in findSimilar:", error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
  async generateAiResponse(ctx) {
    try {
      const { query } = ctx.request.body;

      if (!query) {
        return ctx.badRequest("Missing 'query' in request body.");
      }

      if (query.length < 3) {
        return ctx.badRequest("Query must be at least 3 characters long.");
      }

      // Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Generate the embedding for the input query
      const response = await openai.embeddings.create({
        input: query,
        model: "text-embedding-3-small",
      });

      const queryEmbedding = response.data[0].embedding;
      const vectorString = `[${queryEmbedding.join(",")}]`;

      // Get the database connection from Strapi
      const db = strapi.db.connection;

      // Query PostgreSQL using cosine similarity search, limit to 2 results
      const { rows } = await db.raw(
        `
        SELECT documentid, content, embedding <=> ? AS similarity
        FROM blog_embedding_oai_small
        ORDER BY similarity ASC
        LIMIT 2;  -- Limit to 2 blogs
        `,
        [vectorString]
      );

      // Extract the context from the search results
      const context = rows.map((row) => ({
        documentid: row.documentid,
        content: row.content,
        similarity: row.similarity,
      }));

      // Generate a response using the Synthesizer service
      const responseData = await strapi
        .service("api::search-blog.search-blog")
        .generateResponse(query, context);

      return ctx.send(responseData); // Only send the AI response
    } catch (error) {
      console.error("Error in generateAiResponse:", error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
};
