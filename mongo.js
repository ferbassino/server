const mongoose = require("mongoose");

// `mongodb+srv://ferbassino:${CLAVE}@cluster0.wbozqys.mongodb.net/kinapp-data?retryWrites=true&w=majority`;

const connectionString = process.env.MONGO_DB_URI;
CLAVE = process.env.CLAVE;

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
