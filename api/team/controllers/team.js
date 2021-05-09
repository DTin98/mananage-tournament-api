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
    const teams = await strapi.services["team"].find({
      "board.tournament.owner": userId,
    });

    return sanitizeEntity(teams, {
      model: strapi.query("team").model,
    });
  },
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
  create: async (ctx) => {
    const userId = ctx.state.user._id;
    const name = ctx.request.body.name;

    //validate
    if (name === undefined || name === null)
      return ctx.throw(400, "name is require");
    if (typeof name !== "string")
      return ctx.throw(400, "name must be a number");

    const isExistedName = await strapi.services["team"].findOne({
      name: name,
      "board.tournament.owner": userId,
    });

    if (isExistedName) ctx.throw(400, "name already exists");

    //Generate board
    const boardA = await strapi.services["board"].findOne(
      {
        name: "Bảng A",
        "tournament.owner": userId,
      },
      ["teams"]
    );
    const boardB = await strapi.services["board"].findOne(
      {
        name: "Bảng B",
        "tournament.owner": userId,
      },
      ["teams"]
    );
    let shouldUpdateBoardId = boardA.id;
    if (boardB.teams.length < boardA.teams.length)
      shouldUpdateBoardId = boardB.id;

    const team = await strapi.services["team"].create({
      name: name,
      board: shouldUpdateBoardId,
    });

    return _.omit(team, ["created_by", "updated_by"]);
  },
};
