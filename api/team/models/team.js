"use strict";

const { stringToSlug } = require("../../../utils/helpers");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      if (!data.slug) data.slug = stringToSlug(data.name);
      //Generate board
      const boardA = await strapi.services["board"].findOne(
        {
          name: "Bảng A",
        },
        ["teams"]
      );
      const boardB = await strapi.services["board"].findOne(
        {
          name: "Bảng B",
        },
        ["teams"]
      );
      let shouldUpdateBoardId = boardA.id;
      if (boardB.teams.length < boardA.teams.length)
        shouldUpdateBoardId = boardB.id;
      data.board = shouldUpdateBoardId;
    },
    async afterCreate(data) {
      //Generate match
      const teams = await strapi.services["team"].find({
        board: data.board,
      });
      for (let team of teams) {
        if (data.name == team.name) continue;
        const match = await strapi.services["match"].create();
        const matchRound = await strapi.services["match-round"].create({
          team1: data.id,
          team2: team.id,
          match: match.id,
          board: team.board,
        });
      }
    },
  },
};
