"use strict";

/**
 * Ownership middleware for the Address API
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      const user = ctx.state.user; // Logged-in user

      // If the user is not logged in, return unauthorized
      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this resource."
        );
      }

      const { id } = ctx.params; // Extract document ID from URL (e.g., /addresses/:id)
      const addressDocumentId = id;
      const method = ctx.request.method; // HTTP method (GET, POST, PUT, DELETE)
      console.log("method", method, addressDocumentId);

      if (addressDocumentId) {
        // For requests with a specific document ID (findOne, update, delete)
        const address = await strapi.documents("api::address.address").findOne({
          documentId: addressDocumentId,
          populate: ["user"],
        });

        if (!address) {
          return ctx.notFound(
            "The address you are trying to access does not exist."
          );
        }

        if (address.user?.documentId !== user.documentId) {
          return ctx.unauthorized(
            "You do not have permission to access or modify this address."
          );
        }
        if ((method === "PUT" || method === "PATCH") && ctx.request.body.data) {
          if (ctx.request.body.data.user) {
            return ctx.badRequest(
              "Updating the user field of an address is not allowed."
            );
          }
        }
      } else if (method === "GET") {
        // For find requests (GET /addresses)
        ctx.query.filters = {
          ...ctx.query.filters,
          user: { documentId: user.documentId }, // Restrict results to the logged-in user
        };
      } else if (method === "POST") {
        // For create requests (POST /addresses)
        if (ctx.request.body.data.user) {
          // Remove the user payload if explicitly provided
          delete ctx.request.body.data.user;
        }
        // Automatically associate the logged-in user
        ctx.request.body.data.user = {
          connect: [user.documentId], // Automatically connect the user by documentId
        };
      }

      // Proceed to the next middleware or controller
      await next();
    } catch (err) {
      // Log the error and return a generic error response
      return ctx.internalServerError(
        "An unexpected error occurred. Please try again later."
      );
    }
  };
};
