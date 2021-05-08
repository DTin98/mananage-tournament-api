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
  create: async (ctx) => {
    const id = ctx.params.id;
    const name = ctx.request.body.name;
    const slug = ctx.request.body.slug;

    //validate
    if (name === undefined || name === null)
      return ctx.throw(400, "name is require");
    if (typeof name !== "string")
      return ctx.throw(400, "name must be a number");
    if (slug && typeof slug !== "string")
      return ctx.throw(400, "slug must be a number");

    let boardA = await strapi.services["board"].findOne(
      {
        name: "Bảng A",
      },
      ["teams"]
    );
    if (!boardA)
      boardA = await strapi.services["board"].create({
        name: "Bảng A",
      });

    let boardB = await strapi.services["board"].findOne(
      {
        name: "Bảng B",
      },
      ["teams"]
    );
    if (!boardB)
      boardB = await strapi.services["board"].create({
        name: "Bảng B",
      });

    const createdTeam = await strapi.services["team"].create({
      name: name,
      slug: slug,
    });

    let boardUpdateId = boardA.id;
    if (boardA.teams.length > boardB.teams.length) boardUpdateId = boardB.id;

    const team = await strapi.services["team"].update(
      {
        id: createdTeam,
      },
      {
        board: boardUpdateId,
      }
    );

    return _.omit(team, ["created_by", "updated_by"]);
  },
};
