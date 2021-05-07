"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async (ctx) => {
    const tournaments = await strapi.services["tournament"].find({}, [
      { path: "boards", select: "name slug -tournament" },
    ]);

    return sanitizeEntity(tournaments, {
      model: strapi.query("tournament").model,
    });
  },
  findOne: async (ctx) => {
    const slug = ctx.params.tournamentSlug;
    const tournament = await strapi.services["tournament"].findOne({
      slug: slug,
    });

    if (!tournament) {
      ctx.response.status = 404;
      ctx.throw(404, "name of tournament is not found");
      return;
    }
    return sanitizeEntity(tournament, {
      model: strapi.query("tournament").model,
    });
  },

  findBoards: async (ctx) => {
    const slug = ctx.params.tournamentSlug;
    const boards = await strapi.services["board"].find({
      "tournament.slug": slug,
    });

    const sanitizeBoards = [];
    boards.map((board) => {
      sanitizeBoards.push(
        _.omit(board, [
          "tournament",
          // "matchRounds",
          "teams",
        ])
      );
    });

    return sanitizeEntity(sanitizeBoards, {
      model: strapi.query("tournament").model,
    });
  },
};
