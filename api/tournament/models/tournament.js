"use strict";

const { stringToSlug } = require("../../../utils/helpers");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  /**
   * Triggered before tournament creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      if (!data.slug) data.slug = stringToSlug(data.name);
    },
  },
};
