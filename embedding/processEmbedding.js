const axios = require("axios");

const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const generateEmbedding = async (blog, pgClient) => {
  try {
    const {
      documentId,
      Title,
      content,
      short_content,
      Blog_author,
      blog_category,
    } = blog;

    const cleanContent = stripHtml(content);
    const category = blog_category?.name || "";

    const text = `
      Title: ${Title}
      Author: ${Blog_author}
      Category: ${category}
      Summary: ${short_content}
      Content: ${cleanContent}
    `.trim();

    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: text,
        model: "text-embedding-3-small",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const embedding = response.data.data[0].embedding;

    await pgClient.query(
      `
      INSERT INTO blog_embedding_oai_small (documentId, embedding,content)
      VALUES ($1, $2,$3)
      ON CONFLICT (documentId)
      DO UPDATE SET embedding = EXCLUDED.embedding
      `,
      [documentId, JSON.stringify(embedding), text]
    );

    console.log(`✅ Embedded Blog ID: ${documentId} - "${Title}"`);
    return true;
  } catch (error) {
    console.error(`❌ Error embedding Blog ID: ${blog.documentId}`, error);
    return false;
  }
};

module.exports = generateEmbedding;
