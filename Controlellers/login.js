//recuperamos jsonwebtoken
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");
require("dotenv").config();
//-------------CORS-----------------
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
//-------------CORS-----------------

//hacemos la peticion post , la ruta es api/login, o sea que en el forntend va a haber un formulario de logeo donde ingresamos el username y el password, eso lo vamos a capturar aca porque lo tenemos que comparar con la base de datos para ver si el usuario existe
loginRouter.post("/", async (request, response) => {
  //extraemos body de la request
  const { body } = request;
  //y extraemos el username y el password del body
  const { username, password } = body;
  //BUSQUEDA EN BASE DE DATOS: guardamos en user lo que viene de buscar en la base de datos si existe el username. si existe lo guarda en user, sino da un false
  const user = await User.findOne({ username });
  //  si user es null es false sino compara el password encriptado de la peticion (metodo de bcript) con el password de la base de datos
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  //entonces si no existen user y passwordcorrect manda un error
  if (!(user && passwordCorrect)) {
    response.status(401).json({
      error: "invalid user or password",
    });
  }

  //------------------TOKEN-----------------------
  //guardamos en userfortoken el usuario encontrado en la base de datos, su id y el username
  //no se
  const userForToken = {
    id: user._id,
    username: user.username,
  };
  //creamos el tokenlno, le decimos que queremos firmar userfortoken y le decimos la palabra secreta, y ademas le decimos que expire en un tercer parametro
  const SECRET = process.env.SECRET;

  const token = jwt.sign(userForToken, "petroca");
  // const token = jwt.sign(userForToken, process.env.SECRET);
  //------------------Token---------------------
  //en la response tambien devolvemos el token
  response.send({
    name: user.name,
    username: user.username,
    token,
  });
});

module.exports = loginRouter;
