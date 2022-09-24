module.exports = (error, request, response, next) => {
  console.error(error);
  //el error del id equivocado es CastError, por lo tanto:
  if (error.name === "CastError") {
    response.status(400).send({ error: "id used is malformed" });
  } else if (error.name === "jsonWebTokenError") {
    response.status(401).json({
      error: "token missing or invalid",
    });
  } else {
    response.status(500).end();
  }
};
