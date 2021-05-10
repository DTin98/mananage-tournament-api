"use strict";

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
    const userId = ctx.state.user._id;

    const matchKnockouts = await strapi.services["match-knockout"].find({
      "tournament.owner": userId,
    });

    return sanitizeEntity(matchKnockouts, {
      model: strapi.query("match-knockout").model,
    });
  },
  reCreate: async (ctx) => {
    const userId = ctx.state.user._id;

    //delete all
    const deletedMatchKnockouts = await strapi
      .query("match-knockout")
      .model.deleteMany({});

    const boards = await strapi.services["board"].find({
      "tournament.owner": userId,
    });

    boards.map((board) => {
      if (board.teams.length < 2)
        return ctx.throw(400, "The minimum of team is 2 in a board");
    });

    for (let board of boards) {
      const teams = await getSortedTeamsRank(board);
      const createdMatchKnockOut = await strapi.services[
        "match-knockout"
      ].create({
        tournament: board.tournament,
        team1: teams[0],
        team2: teams[1],
      });
    }

    return { isCreated: true };
  },
  updateOne: async (ctx) => {
    const userId = ctx.state.user._id;
    const id = ctx.params.id;
    const isTeam1Winner = ctx.request.body.isTeam1Winner;
    const isTeam2Winner = ctx.request.body.isTeam2Winner;

    //validate
    if (isTeam1Winner === undefined || isTeam1Winner === null)
      return ctx.throw(400, "isTeam1Winner is require");
    if (typeof isTeam1Winner !== "boolean")
      return ctx.throw(400, "isTeam1Winner must be a boolean");
    if (isTeam2Winner === undefined || isTeam2Winner === null)
      return ctx.throw(400, "isTeam2Winner is require");
    if (typeof isTeam2Winner !== "boolean")
      return ctx.throw(400, "isTeam2Winner must be a number");

    const hasMatchKnockOut = await strapi.services["match-knockout"].findOne({
      id: id,
      "tournament.owner": userId,
    });
    if (!hasMatchKnockOut) ctx.throw(400, "id not found");

    const updatedMatchKnockOut = await strapi.services["match-knockout"].update(
      {
        id: id,
      },
      {
        isTeam1Winner: isTeam1Winner,
        isTeam2Winner: isTeam2Winner,
      }
    );

    return _.omit(updatedMatchKnockOut, ["created_by", "updated_by"]);
  },
  getTree: async (ctx) => {
    const userId = ctx.state.user._id;
    const matchKnockouts = await strapi.services["match-knockout"].find({
      "tournament.owner": userId,
    });

    const matchLevel0 = matchKnockouts.filter((match) => match.level === 0);
    const matchLevel1 = matchKnockouts.filter((match) => match.level === 1);

    return {
      final: matchLevel1,
      semifinal: matchLevel0,
    };
  },
};
