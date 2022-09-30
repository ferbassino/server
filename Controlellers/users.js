const usersRouter = require("express").Router();
const User = require("../user");
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
//-------------CORS-----------------

//--------------OBTENER USUARIOS POST------------

usersRouter.get("/", async (request, response) => {
  //guardamos en users todos los usuarios, y con el metodo populate le decimos que nos rellene con la informacion de las evaluaciones, o sea cuando buscamos a todos los usuarios nos trae la informacion de las evaluaciones. podemos indicar que es lo que queremos que añada para no duplicar datos , esto con un segundo parametro
  const users = await User.find({}).populate("evaluations");
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
  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.json(savedUser);
});

module.exports = usersRouter;
