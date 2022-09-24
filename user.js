//modelo del usuario
const mongoose = require("mongoose");
// importamos Schema de mongoose
const Schema = mongoose.Schema;

//cramos un esquema para el usuario

const userSchema = new Schema({
  username: String,
  name: String,
  passwordHash: String,
  //aca hacemos un array (con un object  que tiene un type de tipo objectid y una referencia a modelData que es el esquema de las evaluaciones)  con todos los ids de las  evaluaciones de cada usuario. entonces tambien en modeldata debemo hacer la relacion con el usuario
  evaluations: [
    {
      type: Schema.Types.ObjectId,
      ref: "ModelData",
    },
  ],
});

//tenemos que transformar el to json porque sino nos devuelve un objeto muy complejo. queremos que venga id y no _id, y que tampoco devuelva __v
userSchema.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id;
    delete returnedObj._id;
    delete returnedObj.__v;
    //aca no vamos a devolver el password como en la evaluacion
    delete returnedObj.passwordHash;
  },
});

//ahora lo instanciamos, aca guardamos en una variable el método model de mopngoose que recibe dos parametros: el nombre y que esquema usa

const User = mongoose.model("User", userSchema);

module.exports = User;
