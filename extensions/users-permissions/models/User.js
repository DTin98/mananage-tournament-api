"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterCreate(data) {
      const tournament = await strapi.services["tournament"].create({
        name: "Chung Kết Liên Minh Huyền Thoại Thế Giới",
        owner: data._id,
      });

      const createBoardA = strapi.services["board"].create({
        name: "Bảng A",
        tournament: tournament.id,
      });
      const createBoardB = strapi.services["board"].create({
        name: "Bảng B",
        tournament: tournament.id,
      });
      Promise.all([createBoardA, createBoardB]);
    },
  },
};
