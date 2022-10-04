const mongoose = require("mongoose");
// importamos Schema de mongoose
const Schema = mongoose.Schema;

// definimos el esquema, que tipos de datos podemos tener en una conexion

const modelData = new Schema({
  date: {
    type: Date,
  },
  email: {
    type: String,
  },
  evaluation: {
    type: String,
  },
  segment: {
    type: String,
  },

  csvFile: {
    csvData: String,
    contentType: String,
  },

  //aca establecemos la relacion con el usuario

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

//tenemos que transformar el tojson porque sino en la respuesta nos devuelve un objeto muy complejo. queremos que venga id y no _id, y que tampoco devuelva __v
modelData.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id;
    delete returnedObj._id;
    delete returnedObj.__v;
  },
});

//  con el esquema creamos un modelo para instanciar las notas. model recibe dos parametros, el nombre del modelo que le damos y luego el esquema que tiene que utilizar
const model = mongoose.model("ModelData", modelData);

module.exports = model;
