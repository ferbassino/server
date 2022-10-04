const supertest = require("supertest");

const { app, server } = require("../index");

const mongoose = require("mongoose");

const api = supertest(app);

test("evaluations are returned as json", async () => {
  await api
    .get("/api/evaluations")
    .expect(200)
    .expect("content-type", /application\/json/);
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
