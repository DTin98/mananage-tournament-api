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
      if (data.level >= 1) return;

      //find match-knockouts in a tournament
      const matchKnockouts = await strapi
        .query("match-knockout")
        .model.find({
          tournament: data.tournament,
          level: data.level,
        })
        .sort({ id: -1 });

      let team1 = "";
      let team2 = "";
      if (data.id === matchKnockouts[0].id) {
        if (data.isTeam1Winner) team1 = data.team1.id;
        else team1 = data.team2.id;

        if (
          !matchKnockouts[1].isTeam1Winner &&
          !matchKnockouts[1].isTeam2Winner
        )
          return;
        if (matchKnockouts[1].isTeam1Winner) team2 = matchKnockouts[1].team1;
        else team2 = matchKnockouts[1].team2;
      }

      if (data.id === matchKnockouts[1].id) {
        if (data.isTeam1Winner) team2 = data.team1.id;
        else team2 = data.team2.id;

        if (
          !matchKnockouts[0].isTeam1Winner &&
          !matchKnockouts[0].isTeam2Winner
        )
          return;
        if (matchKnockouts[0].isTeam1Winner) team1 = matchKnockouts[0].team1;
        else team1 = matchKnockouts[0].team2;
      }

      //update or create a matchKnockout
      await strapi.query("match-knockout").model.update(
        { level: data.level + 1 },
        {
          tournament: data.tournament,
          level: data.level + 1,
          isTeam1Winner: false,
          isTeam2Winner: false,
          team1: team1,
          team2: team2,
        },
        { upsert: 1 }
      );
    },
  },
};
