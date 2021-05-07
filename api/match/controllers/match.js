"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async (ctx) => {
    const matchRounds = await strapi.services["match-round"].find({}, [
      { path: "board", select: "name" },
      { path: "team1", select: "name" },
      { path: "team2", select: "name" },
      { path: "match", select: "status team1Score team2Score date" },
    ]);

    return sanitizeEntity(matchRounds, {
      model: strapi.query("match").model,
    });
  },
};
