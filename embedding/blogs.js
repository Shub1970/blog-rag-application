require("dotenv").config();
const { Client } = require("pg");
const fetchBlogsPage = require("./fetchBlogs");
const generateEmbedding = require("./processEmbedding");

const getAllBlogs = async () => {
  try {
    const baseUrl = "http://localhost:1337";

    // ✅ Use environment variables
    const pgClient = new Client({
      user: process.env.DATABASE_USERNAME,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
    });

    console.log("🔌 Connecting to database...", {
      user: process.env.DATABASE_USERNAME,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
    });

    await pgClient.connect();

    try {
      let currentPage = 1;
      let totalPages = 1;
      let processedCount = 0;

      const initialData = await fetchBlogsPage(baseUrl, currentPage);
      totalPages = initialData.pagination.pageCount;
      console.log(
        `🔍 Found ${initialData.pagination.total} blogs across ${totalPages} pages`
      );

      while (currentPage <= totalPages) {
        console.log(`📄 Processing page ${currentPage} of ${totalPages}`);
        const { blogs } = await fetchBlogsPage(baseUrl, currentPage);

        for (const blog of blogs) {
          const success = await generateEmbedding(blog, pgClient);
          if (success) {
            processedCount++;
          }
        }
        currentPage++;
      }

      console.log(`✅ Successfully processed ${processedCount} blogs`);
      return true;
    } finally {
      await pgClient.end();
    }
  } catch (error) {
    console.error("❌ Error in getAllBlogs:", error);
    return false;
  }
};

getAllBlogs();
