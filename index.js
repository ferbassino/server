//vamos a requerir el dotenv para las variables de entorno
require("dotenv").config();
//requerimos la conexion
require("./mongo");
const express = require("express");
const mongoose = require("mongoose");
//requerimos el modelo de los datos del paciente
const ModelData = require("./models/model_data");
const fileUpload = require("express-fileupload");
//compartir recursos de distintos origenes, podemos decidir que origenes acceden a nuestro recurso
const cors = require("cors");
const usersRouter = require("./Controlellers/users");
const loginRouter = require("./Controlellers/login");
const bodyParser = require("body-parser");
const notFound = require("./middlewares/notFound");
const handleErrors = require("./middlewares/handleErrors");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const app = express();

//middlewares: son funciones que interceptan las peticiones (use se refiere a cualquier peticion) y se ejecutan en orden de arriba ajajo y evalua como se requieren los recursos y se aplican si encajan, por ejemplo en un get, post, y asi. muy util para los 404
app.use(fileUpload());
app.use(
  cors({
    origin: "*",
  })
);
//para soportar lo que viene en la request y parsearlo
app.use(express.json());
//no se si es necesario esto
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "true" }));

app.get("/", (req, res) => {
  res.send("pusimos cors agregamos expres");
});

//------------TODOS LOS RECURSOS-------------
app.get("/api/evaluations", async (request, response) => {
  const evaluations = await ModelData.find({}).populate("user", {
    username: 1,
    name: 1,
  });

  response.json(evaluations);
});

//------------- OBTENER UN RECURSO
app.get("/api/evaluations/:id", (req, res, next) => {
  //recordemos que el ":" indica que lo que viene despues es dinamico, en este caso queremos capturar el id para obtener un recurso, en la request lo dinamico viene en un objeto llamado params.  guardamos en una variable id lo que viene en la request como req.params.id
  const id = req.params.id;

  //para encontrarlo aplicamos el metodo de mongoose findById(id) que encuentra el recurso y devuelve todos los datos de la base de ese recurso
  ModelData.findById(id)
    .then((data) => {
      //retornamos los datos
      return res.json(data);
    })
    //si el id no es cvorrecto capturamos el error y ejecutamos el next con el error y va a ir al middleware que tiene el error que es handleerrors
    .catch((err) => {
      next(err);
    });
});

//-----------ACTUALIZAR UN RECURSO --------- falta actualizar el archivo csv???
app.put("/api/evaluations/:id", (req, res, next) => {
  // guardamos en constantes el id y lo que viene de la request
  const id = req.params.id;
  const evaluation = req.body;

  const newEvaluationInfo = {
    email: evaluation.email,
    evaluation: evaluation.evaluation,
    segment: evaluation.segment,
  };

  // lo que hace este metodo es actualizar esa id con la informacion del objeto newEvaluationInfo, ojo que lo que devuelve es lo que encontro y no lo que se modifico, para eso en el 3 parametro le pasamos un objeto de configuracion para que devuelva el nuevo valor {new:true}

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
  // validacion por si el file no viene, no funciona
  // if (!req.files.csvFile.data) {
  //   res.status(400).json({
  //     error: "datos incompletos",
  //   });
  // }

  //creamos una evaluacion  con el modelo que respeta el esquema
  const data = {
    date: new Date(),
    email: req.body.email,
    evaluation: req.body.evaluacion,
    segment: req.body.segmento,
  };

  let modelData = new ModelData(data);
  modelData.csvFile.csvData = req.files.csvFile.data;
  modelData.csvFile.contentType = req.files.csvFile.mimetype;

  //---------------TOKEN-----------------
  //vamos a recuperar el token que viene por la cabecera http. La cabecera de petición Authorization contiene las credenciales para autenticar a un usuario en un servidor
  const authorization = req.get("authorization");
  let token = "";
  //ahora validamos si esta la autentificacion y si comienza con la palabre bearer
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    //como la authorization viene en forma: "Bearer lsdafkjjasjdf...", le quitamos los 7 primeros caracteres para guardar en token solo el token
    token = authorization.substring(7);
  }

  //vamos a decodificar la informacion del token

  // const decodedToken = jwt.verify(token, process.env.SECRET);
  const decodedToken = jwt.verify(token, "petroca");

  //validamos otra vez para decir que no hay acceso
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }
  //recuperamos el usuario que creo la nota
  const user = await User.findById(decodedToken.id);

  //Para la evaluación: agregamos el id del usuario que creo la evluacion a la evaluación
  modelData.user = user._id;

  //cargamos la evaluación en la base de datos pero ademas debemos agregar la evaluacion al usuario
  modelData.save((err) => {
    if (!err) {
      //a lo que viene del array de evaluaciones del usuario le concatenamos esta evaluacion
      user.evaluations = user.evaluations.concat(modelData._id);
      //y lo guardamos en la base de datos en el usuario
      user.save();

      res.send(modelData);

      // mongoose.connection.close();
    } else {
      res.send(err);
    }
  });
});

//middlewares. es muy importante el orden de los middlewares. los de errores están al final para que se llamen luego de pasar por todos los endspoints
//para los controladores de las cuenta de usuario
app.use("/api/users", usersRouter);
//para el logeo
app.use("/api/login", loginRouter);

//para el 404, si no entra en inguno de los enndpoint que definimos, que nos de un 404
app.use(notFound);
// middleware para el manejo de errores que recibe tres parametros el primero es el error, si hay error en alguna de las peticiones entra aca
app.use(handleErrors);

//configuramos el puerto para que se utilice una variable de entorno llamada PORT, que está en .env, si no existe esa variable se utiliza 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

module.exports = app;
