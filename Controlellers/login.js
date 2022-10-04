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

loginRouter.post("/", async (request, response) => {
  const { body } = request;
  const { username, password } = body;
  const user = await User.findOne({ username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    response.status(401).json({
      error: "invalid user or password",
    });
  }
  //guradamos la informacion en jwt
  //no se
  const userForToken = {
    id: user._id,
    username: user.username,
  };
  //creamos el tokenlno, le decimos que queremos firmar userfortoken y le decimos la palabra secreta, y ademas le decimos que expire en un tercer parametro
  const SECRET = process.env.SECRET;

  const token = jwt.sign(userForToken, "petroca");
  // const token = jwt.sign(userForToken, process.env.SECRET);

  //en la response tambien devolvemos el token
  response.send({
    name: user.name,
    username: user.username,
    token,
  });
});

module.exports = loginRouter;
