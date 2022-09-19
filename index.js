//vamos a requerir el dotenv para las variables de entorno
require("dotenv").config();

//requerimos la conexion
require("./mongo");
const express = require("express");
const mongoose = require("mongoose");
//requerimos el modelo de los datos del paciente
const ModelData = require("./model_data");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");

// mongoose
//   .connect(
//     "mongodb+srv://ferbassino:tadeo1972@cluster0.wbozqys.mongodb.net/kinapp-data?retryWrites=true&w=majority"
//   )
//   .then(() => {
//     console.log("conectado con la base de datos");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

const app = express();

app.use(fileUpload());
app.use(cors());

//para soportar lo que viene en la request y parsearlo
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "true" }));

app.get("/", (req, res) => {
  res.send("hola desde el backend");
});

//obtener todos los recursos
app.get("/api/evaluations", (req, res) => {
  ModelData.find().then((evaluations) => {
    res.json(evaluations);
  });
});

//obtener un recurso
app.get("/api/evaluations/:id", (req, res) => {
  const id = req.params.id;
  ModelData.findById(id).then((data) => {
    res.json(data);
  });
});

app.post("/api/evaluations", (req, res) => {
  const data = {
    email: req.body.email,
    evaluation: req.body.evaluacion,
    segment: req.body.segmento,
    // csvFile: req.files.csvFile.data,
  };

  let modelData = new ModelData(data);

  modelData.csvFile.csvData = req.files.csvFile.data;
  modelData.csvFile.contentType = req.files.csvFile.mimetype;

  console.log(modelData);

  modelData.save((err) => {
    if (!err) {
      res.send("datos agregados correctamente");
      mongoose.connection.close();
    } else {
      res.send(err);
    }
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
