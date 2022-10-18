//requerimos router de expres que nos permite usar una clase para usar la ruta separada del index

const usersRouter = require("express").Router();
//importamos el modelo
const User = require("../models/user");
//importamos bcrypt para encriptar el password
const bcrypt = require("bcrypt");
const express = require("express");

//-------------CORS-----------------
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
//------------------------------

//--------------OBTENER USUARIOS GET------------

usersRouter.get("/", async (request, response) => {
  //guardamos en users todos los usuarios, y con el metodo populate le decimos que nos rellene con la informacion de las evaluaciones, o sea cuando buscamos a todos los usuarios nos trae la informacion de las evaluaciones. podemos indicar que es lo que queremos que añada para no duplicar datos , esto con un segundo parametro. o sea que no solo viene el id con el usuario sino que viene cada evaluacion con su contenido
  const users = await User.find({}).populate("evaluations", {
    email: 1,
    date: 1,
    evaluation: 1,
    segment: 1,
    _id: 0,
  });
  response.json(users);
});
//--------------CREAR USUARIO POST------------
//la ruta es relativa a partir de /api/users
usersRouter.post("/", async (request, response) => {
  const { body } = request;
  const { username, name, password } = body;

  //para encriptar el pasword con bcrypt guardamos en una constante el metodo hash, que recibe dos parametros: , el password que queremos hashear y la complejidad algoritmica con la que querejos que se hashee (saltround), a mas complejidad, mas tarda(por eso es asincrono) pero mas seguridad

  const saltround = 10;
  const passwordHash = await bcrypt.hash(password, saltround);
  //creamos el usuario con el modelo, fijate que las constantes de llaman igual menos el password que esta en la variable encriptada
  const user = new User({
    username,
    name,
    passwordHash,
  });

  //una vez que tenemos la intancia la guardamos esperando al user.save
  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
