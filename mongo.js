const mongoose = require("mongoose");

const connectionString = process.env.MONGO_DB_URI;

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("conectado con la base de datos");
  })
  .catch((err) => {
    console.error(err);
  });
