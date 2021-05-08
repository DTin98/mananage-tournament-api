"use strict";

const _ = require("lodash");
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
  update: async (ctx) => {
    const id = ctx.params.id;
    const team1Score = ctx.request.body.team1Score;

    //validate
    if (team1Score === undefined || team1Score === null)
      return ctx.throw(400, "team1Score is require");
    if (typeof team1Score !== "number")
      return ctx.throw(400, "team1Score must be a number");
    const team2Score = ctx.request.body.team2Score;
    if (team2Score === undefined || team2Score === null)
      return ctx.throw(400, "team2Score is require");
    if (typeof team2Score !== "number")
      return ctx.throw(400, "team2Score must be a number");

    const matchRounds = await strapi.services["match-round"].findOne({
      id: id,
    });

    const updatedMatch = await strapi.services["match"].update(
      {
        id: matchRounds.match.id,
      },
      { team1Score: team1Score, team2Score: team2Score }
    );

    return _.omit(updatedMatch, ["created_by", "updated_by"]);
  },
};
