"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      //create match
      const createdMatch = await strapi.services["match"].create();
      data.match = createdMatch.id;
    },
  },
};
