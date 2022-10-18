const mongoose = require("mongoose");

// `mongodb+srv://ferbassino:${CLAVE}@cluster0.wbozqys.mongodb.net/kinapp-data?retryWrites=true&w=majority`;

// const connectionString = process.env.MONGO_DB_URI;

//extraemos todas las variables de entorno que necesitamos del .env y para que se configure el connectiong string segun estemos en produccion o en test hacemos un condicional

const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env;

const connectionString = NODE_ENV === "test" ? MONGO_DB_URI_TEST : MONGO_DB_URI;

CLAVE = process.env.CLAVE;
//conexion a mongodb
mongoose
  .connect(
    "mongodb+srv://ferbassino:123@cluster0.wbozqys.mongodb.net/kinapp-data?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("conectado con la base de datos");
  })
  .catch((err) => {
    console.error(err);
  });

process.on("uncaughtException", (error) => {
  console.log(error(error));
  mongoose.disconnect();
});
