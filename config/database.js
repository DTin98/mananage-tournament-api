module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        uri: env(
          "DATABASE_URI",
          "mongodb+srv://admin:adminadmin123123@cluster0.cehv1.mongodb.net/test"
        ),
        srv: env.bool("DATABASE_SRV", true),
        port: env.int("DATABASE_PORT", 27017),
        database: env("DATABASE_NAME"),
      },
      options: {
        authenticationDatabase: env("AUTHENTICATION_DATABASE", "admin"),
        ssl: env.bool("DATABASE_SSL", true),
      },
    },
  },
});
