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
      let boardA = await strapi.services["board"].findOne(
        {
          name: "Bảng A",
        },
        ["teams"]
      );
      let boardB = await strapi.services["board"].findOne(
        {
          name: "Bảng B",
        },
        ["teams"]
      );
      let shouldUpdateBoardId = boardA.id;
      if (boardA.teams.length > boardB.teams.length)
        shouldUpdateBoardId = boardB.id;
      data.board = shouldUpdateBoardId;
    },
  },
};
