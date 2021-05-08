"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  findInBoard: async (ctx) => {
    const tournamentSlug = ctx.params.tournamentSlug;
    const boardSlug = ctx.params.boardSlug;
    const matchRounds = await strapi.services["match-round"].find({
      "board.tournament.slug": tournamentSlug,
      "board.slug": boardSlug,
    });

    return sanitizeEntity(matchRounds, {
      model: strapi.query("match-round").model,
    });
  },
};
