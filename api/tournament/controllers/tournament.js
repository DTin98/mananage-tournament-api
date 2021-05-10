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

  deleteAll: async (ctx) => {
    const userId = ctx.state.user._id;

    const session = await strapi.connections.default.startSession();
    try {
      session.startTransaction();
      const matchIds = [];
      const matchRounds = await strapi.services["match-round"].find({}, [
        { path: "board", populate: { path: "tournament" } },
      ]);
      const matchKnockouts = await strapi.services["match-knockout"].find({}, [
        { path: "tournament" },
      ]);
      const boards = await strapi.services["board"].find({});

      for (let board of boards) {
        if (board.tournament.owner.toString() == userId) {
          await strapi
            .query("team")
            .model.deleteMany({ board: board._id })
            .session(session);
        }
      }

      for (let matchRound of matchRounds) {
        if (matchRound.board.tournament.owner.toString() == userId) {
          matchIds.push(matchRound.match.id);
          await strapi
            .query("match-round")
            .model.deleteMany({ _id: matchRound._id })
            .session(session);
        }
      }

      for (let matchKnockout of matchKnockouts) {
        if (matchKnockout.tournament.owner.toString() == userId) {
          matchIds.push(matchKnockout.match.id);
          await strapi
            .query("match-knockout")
            .model.deleteMany({ _id: matchKnockout._id })
            .session(session);
        }
      }

      for (let id of matchIds) {
        await strapi
          .query("match")
          .model.deleteMany({ id: id })
          .session(session);
      }

      await session.commitTransaction();
    } catch (error) {
      console.error(error);
      return { isCleared: false };
    }

    return { isCleared: true };
  },
};
