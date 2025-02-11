// ./src/api/search-blog/routes/search-blog.js
"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/search-blog/similar",
      handler: "search-blog.findSimilar",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
    {
      method: "POST",
      path: "/ai-response",
      handler: "search-blog.generateAiResponse",
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
  ],
};
