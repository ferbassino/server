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
const notFound = require("./middlewares/notFound");
const handleErrors = require("./middlewares/handleErrors");

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());
//para soportar lo que viene en la request y parsearlo
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "true" }));

app.get("/", (req, res) => {
  res.send("hola desde el backend");
});

//------------TODOS LOS RECURSOS-------------
app.get("/api/evaluations", (req, res) => {
  ModelData.find().then((evaluations) => {
    res.json(evaluations);
  });
});

//------------- OBTENER UN RECURSO
app.get("/api/evaluations/:id", (req, res, next) => {
  const id = req.params.id;

  ModelData.findById(id)
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

//-----------ACTUALIZAR UN RECURSO --------- No funciona
app.put("/api/evaluations/:id", (req, res, next) => {
  // guardamos en constantes el id y lo que viene de la request
  const id = req.params.id;
  const evaluation = req.body;

  console.log(req);

  const newEvaluationInfo = {
    email: evaluation.email,
    evaluation: evaluation.evaluation,
    segment: evaluation.segment,
    // csvFile: {
    //   csvData: evaluation.files.csvFile.data,
    //   contentType: evaluation.files.csvFile.mimetype,
    // },
  };

  // lo que hace este metodo es actualizar esa id con la informacion del objeto newEvaluationInfo

  ModelData.findByIdAndUpdate(id, newEvaluationInfo, { new: true })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

//---------------ELIMINAR UN RECURSO --------------
app.delete("/api/evaluations/:id", (req, res, next) => {
  const id = req.params.id;
  ModelData.findByIdAndDelete(id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

//----------------CARGAR UN RECURSO-------------
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
      // mongoose.connection.close();
    } else {
      res.send(err);
    }
  });
});

//middlewares
//para el 404, si no entra en inguno de los enndpoint que definimos, que nos de un 404
app.use(notFound);
// middleware para el manejo de errores que recibe tres parametros el primero es el error
app.use(handleErrors);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
