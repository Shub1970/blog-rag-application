"use strict";

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // Fetch newly created blog with populated category
      const blog = await strapi.entityService.findOne(
        "api::blog.blog",
        result.id,
        { populate: ["blog_category"] }
      );
      console.log("blog after create", blog);

      if (!blog) {
        throw new Error("Blog not found after creation.");
      }

      const {
        documentId,
        Title,
        content,
        short_content,
        Blog_author,
        blog_category,
      } = blog;

      const category = blog_category?.title || "Uncategorized";

      // Generate embedding using service
      await strapi.service("api::blog.blog").generateEmbedding({
        documentId,
        Title,
        content,
        short_content,
        Blog_author,
        category, // Pass category name instead of object
      });

      console.log(`✅ Embedding created for Blog ID: ${documentId}`);
    } catch (error) {
      console.error("🚨 Error generating embedding:", error);
    }
  },
};
