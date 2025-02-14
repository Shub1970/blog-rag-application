"use strict";

/**
 * address router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::address.address", {
  config: {
    find: {
      middlewares: ["api::address.ownership"], // Apply ownership middleware to `find`
    },
    findOne: {
      middlewares: ["api::address.ownership"], // Apply ownership middleware to `findOne`
    },
    update: {
      middlewares: ["api::address.ownership"], // Apply ownership middleware to `update`
    },
    delete: {
      middlewares: ["api::address.ownership"], // Apply ownership middleware to `delete`
    },
    // Add default logic for `create` action
    create: {
      middlewares: ["api::address.ownership"], // No specific middleware
    },
    // Add default logic for `deleteMany` action
    deleteMany: {
      middlewares: [], // No specific middleware
    },
  },
});
