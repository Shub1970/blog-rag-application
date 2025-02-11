// const fetch = require("node-fetch");

const fetchBlogsPage = async (baseUrl, page, pageSize = 100) => {
  console.log(
    `🔍 Fetching page ${page} of blogs...`,
    "url",
    `${baseUrl}/api/blogs?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`
  );
  const response = await fetch(
    `${baseUrl}/api/blogs?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`
  );
  const data = await response.json();
  return {
    blogs: data.data || [],
    pagination: data.meta.pagination || {},
  };
};

module.exports = fetchBlogsPage;
