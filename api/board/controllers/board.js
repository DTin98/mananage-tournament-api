"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async (ctx) => {
    const boards = await strapi.services["board"].find({}, [
      { path: "tournament", select: "name slug" },
    ]);

    return sanitizeEntity(boards, {
      model: strapi.query("board").model,
    });
  },
  findOne: async (ctx) => {
    const tournamentSlug = ctx.params.tournamentSlug;
    const boardSlug = ctx.params.boardSlug;
    const board = await strapi.services["board"].findOne(
      {
        "tournament.slug": tournamentSlug,
        slug: boardSlug,
      },
      [
        {
          path: "matchRounds",
          populate: [
            { path: "team1", select: "name slug" },
            { path: "team2", select: "name slug" },
            { path: "match", select: "status team1Score team2Score date" },
          ],
        },
      ]
    );

    if (!board) {
      ctx.response.status = 404;
      ctx.throw(404, "tournament or board is not found");
      return;
    }

    const sanitizeBoard = _.omit(board, [
      "tournament",
      // "matchRounds",
      "teams",
    ]);

    return sanitizeEntity(sanitizeBoard, {
      model: strapi.query("tournament").model,
    });
  },
};
