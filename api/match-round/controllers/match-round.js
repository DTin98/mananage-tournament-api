"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async (ctx) => {
    const userId = ctx.state.user._id;
    const matchRounds = await strapi.services["match-round"].find(
      { "board.tournament.owner": userId },
      [
        { path: "board", select: "name" },
        { path: "team1", select: "name" },
        { path: "team2", select: "name" },
        { path: "match", select: "status team1Score team2Score date" },
      ]
    );

    return sanitizeEntity(matchRounds, {
      model: strapi.query("match").model,
    });
  },
  findInBoard: async (ctx) => {
    const userId = ctx.state.user._id;
    const tournamentSlug = ctx.params.tournamentSlug;
    const boardSlug = ctx.params.boardSlug;
    const matchRounds = await strapi.services["match-round"].find({
      "board.tournament.slug": tournamentSlug,
      "board.slug": boardSlug,
      "board.tournament.owner": userId,
    });

    return sanitizeEntity(matchRounds, {
      model: strapi.query("match-round").model,
    });
  },
  update: async (ctx) => {
    const userId = ctx.state.user._id;
    const id = ctx.params.id;
    const team1Score = ctx.request.body.team1Score;
    const team2Score = ctx.request.body.team2Score;
    const date = ctx.request.body.date;

    //validate
    if (team1Score === undefined || team1Score === null)
      return ctx.throw(400, "team1Score is require");
    if (typeof team1Score !== "number")
      return ctx.throw(400, "team1Score must be a number");
    if (team2Score === undefined || team2Score === null)
      return ctx.throw(400, "team2Score is require");
    if (typeof team2Score !== "number")
      return ctx.throw(400, "team2Score must be a number");

    const matchRounds = await strapi.services["match-round"].findOne({
      id: id,
      "board.tournament.owner": userId,
    });
    if (!matchRounds) ctx.throw(400, "id not found");

    const updatedMatch = await strapi.services["match"].update(
      {
        id: matchRounds.match.id,
      },
      { team1Score: team1Score, team2Score: team2Score, date: date }
    );

    return _.omit(updatedMatch, ["created_by", "updated_by"]);
  },
  delete: async (ctx) => {
    const userId = ctx.state.user._id;
    const id = ctx.params.id;
    const team1Score = ctx.request.body.team1Score;
    const team2Score = ctx.request.body.team2Score;
    const date = ctx.request.body.date;

    //validate
    if (team1Score === undefined || team1Score === null)
      return ctx.throw(400, "team1Score is require");
    if (typeof team1Score !== "number")
      return ctx.throw(400, "team1Score must be a number");
    if (team2Score === undefined || team2Score === null)
      return ctx.throw(400, "team2Score is require");
    if (typeof team2Score !== "number")
      return ctx.throw(400, "team2Score must be a number");

    const matchRounds = await strapi.services["match-round"].findOne({
      id: id,
      "board.tournament.owner": userId,
    });
    if (!matchRounds) ctx.throw(400, "id not found");

    const updatedMatch = await strapi.services["match"].update(
      {
        id: matchRounds.match.id,
        published_at: null,
      },
      { team1Score: team1Score, team2Score: team2Score, date: date }
    );

    return _.omit(updatedMatch, ["created_by", "updated_by"]);
  },
};
