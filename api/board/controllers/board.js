"use strict";

const { map } = require("lodash");
const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const getSortedTeamsRank = (board) => {
  return new Promise((resolve, reject) => {
    const teams = {};
    board.teams.map((team) => {
      teams[team.id] = 0;
    });

    const matchRounds = board.matchRounds;
    for (let matchRound of matchRounds) {
      teams[matchRound.team1] += matchRound.match.team1Score;
      teams[matchRound.team2] += matchRound.match.team2Score;
    }

    let sortedTeam = Object.keys(teams).sort(function (a, b) {
      return teams[b] - teams[a];
    });

    resolve(sortedTeam);
  });
};

module.exports = {
  find: async (ctx) => {
    const boards = await strapi.services["board"].find({}, [
      { path: "tournament", select: "name slug" },
    ]);

    return sanitizeEntity(boards, {
      model: strapi.query("board").model,
    });
  },
  findAll: async (ctx) => {
    const userId = ctx.state.user._id;
    const boards = await strapi.services["board"].find(
      { "tournament.owner": userId },
      [
        { path: "tournament", select: "name slug" },
        {
          path: "teams",
        },
        {
          path: "matchRounds",
          populate: "match",
        },
      ]
    );
    let result = _.cloneDeep(boards);

    for (let q = 0; q < result.length; q++) {
      const teams = await getSortedTeamsRank(result[q]);
      result[q].teams.map((team, i) => {
        if (team._id != teams[i]) {
          const index = result[q].teams.findIndex((e) => e._id == teams[i]);
          let tmp = { ...team };
          result[q].teams[i] = result[q].teams[index];
          result[q].teams[index] = tmp;
        }
      });
    }

    return sanitizeEntity(result, {
      model: strapi.query("board").model,
    });
  },
  findOne: async (ctx) => {
    const userId = ctx.state.user._id;
    const tournamentSlug = ctx.params.tournamentSlug;
    const boardSlug = ctx.params.boardSlug;
    const board = await strapi.services["board"].findOne(
      {
        "tournament.owner": userId,
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
