//vamos a requerir el dotenv para las variables de entorno
require("dotenv").config();
//requerimos la conexion
require("./mongo");
const express = require("express");
const mongoose = require("mongoose");
//requerimos el modelo de los datos del paciente
const ModelData = require("./model_data");
const fileUpload = require("express-fileupload");
//compartir recursos de distintos origenes, podemos decidir que origenes acceden a nuestro recurso
const cors = require("cors");
const usersRouter = require("./Controlellers/users");
const loginRouter = require("./Controlellers/login");
const bodyParser = require("body-parser");
const notFound = require("./middlewares/notFound");
const handleErrors = require("./middlewares/handleErrors");
const User = require("./user");
const jwt = require("jsonwebtoken");

const app = express();

//middlewares: son funciones que interceptan las peticiones (use se refiere a cualquier peticion) y se ejecutan en orden de arriba ajajo y evalua como se requieren los recursos y se aplican si encajan, por ejemplo en un get, post, y asi. muy util para los 404
app.use(fileUpload());
app.use(cors());
//para soportar lo que viene en la request y parsearlo
app.use(express.json());
//no se si es necesario esto
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "true" }));

app.get("/", (req, res) => {
  res.send("hola desde el backend a ver ahora");
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

//-----------ACTUALIZAR UN RECURSO --------- falta actualizar el archivo csv???
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
    //   csvData: req.files.csvFile.data,
    //   contentType: req.files.csvFile.mimetype,
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
app.post("/api/evaluations", async (req, res) => {
  const data = {
    email: req.body.email,
    evaluation: req.body.evaluacion,
    segment: req.body.segmento,
  };

  //validacion por si el file no viene, no funciona
  // if (req.files.csvFile.data === undefined) {
  //   res.status(400).json({
  //     error: "datos incompletos",
  //   });
  // }
  let modelData = new ModelData(data);
  modelData.csvFile.csvData = req.files.csvFile.data;
  modelData.csvFile.contentType = req.files.csvFile.mimetype;

  //---------------TOKEN-----------------
  //vamos a recuperar el token por la cabecera
  const authorization = req.get("authorization");
  let token = "";
  //ahora validamos si esta la autentificacion y si comienza con la palabre bearer
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    token = authorization.substring(7);
  }
  //modificacion
  //vamos a decodificar la informacion del token

  const decodedToken = jwt.verify(token, process.env.SECRET);

  //validamos otra vez para decir que no hay acceso
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  modelData.user = user._id;

  modelData.save((err) => {
    if (!err) {
      user.evaluations = user.evaluations.concat(modelData._id);
      user.save();

      res.send(modelData);

      // mongoose.connection.close();
    } else {
      res.send(err);
    }
  });
});

//middlewares
//para los controladores de las cuenta de usuario
app.use("/api/users", usersRouter);
//para el logeo
app.use("/api/login", loginRouter);

//para el 404, si no entra en inguno de los enndpoint que definimos, que nos de un 404
app.use(notFound);
// middleware para el manejo de errores que recibe tres parametros el primero es el error
app.use(handleErrors);

//configuramos el puerto para que se utilice una variable de entorno llamada PORT, que está en .env, si no existe esa variable se utiliza 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
