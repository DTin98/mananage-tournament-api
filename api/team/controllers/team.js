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
    const teams = await strapi.services["team"].find({
      "board.tournament.slug": tournamentSlug,
      "board.slug": boardSlug,
    });

    const sanitizeTeams = [];
    teams.map((team) => {
      sanitizeTeams.push(_.omit(team, ["board"]));
    });

    return sanitizeEntity(sanitizeTeams, {
      model: strapi.query("team").model,
    });
  },
};
