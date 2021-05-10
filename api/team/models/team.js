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
    },
    async afterCreate(result) {
      //Generate match
      const teams = await strapi.services["team"].find({
        board: result.board,
      });
      for (let team of teams) {
        if (result.name === team.name) continue;
        const match = await strapi.services["match"].create();
        const matchRound = await strapi.services["match-round"].create({
          team1: result.id,
          team2: team.id,
          match: match.id,
          board: team.board,
        });
      }
    },
  },
};
