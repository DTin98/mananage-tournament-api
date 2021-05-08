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

    async afterUpdate(data) {
      if (!data.isTeam1Winner && !data.isTeam2Winner) return;
      //find all match-knockout the same tournament
      const matchKnockouts = await strapi.services["match-knockout"].find({
        tournament: data.tournament,
      });
      //create a matchKnockout
      for (let matchKnockout of matchKnockouts) {
        if (matchKnockout.level !== data.level) continue;
        if (matchKnockout.id === data.id) continue;
        if (!matchKnockout.isTeam1Winner && !matchKnockout.isTeam2Winner)
          continue;

        const team1 = data.isTeam1Winner ? data.team1 : data.team2;
        const team2 = matchKnockout.isTeam1Winner
          ? matchKnockout.team1
          : matchKnockout.team2;
        await strapi.services["match-knockout"].create({
          team1: team1,
          team2: team2,
          level: data.level + 1,
        });
      }
    },
  },
};
