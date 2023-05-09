import  request  from "supertest";
import { app } from "../../src/app.js";
import { Reto } from "../../src/models/reto.js";
import { expect } from "chai";

const primerReto = {
  id: 1,
  nombre: "Reto 1",
  rutas: [],
  tipo: "bicicleta",
  kilometros: 0,
  usuarios: [],
};

const segundoReto = {
  id: 2,
  nombre: "Reto 2",
  rutas: [],
  tipo: "bicicleta",
  kilometros: 0,
  usuarios: [],
};

beforeEach(async () => {
  await Reto.deleteMany({});
  await new Reto(primerReto).save();
  await new Reto(segundoReto).save();
});

describe("POST /challenges", () => {
  it("Se crea un reto", async () => {
    const response = await request(app).post("/challenges").send({
       id: 3,
      nombre: "Reto 3",
      rutas: [],
      tipo: "bicicleta",
      kilometros: 0,
      usuarios: [],
    }).expect(201);

    const segundoReto = await Reto.findById(response.body._id);
    expect(segundoReto).to.not.be.null;
    expect(segundoReto!.nombre).to.equal("Reto 3");
    const response1 = await request(app).post("/challenges").send({
      id: 3,
      nombre: "Reto 3",
      rutas: [],
      tipo: "bicicleta",
      kilometros: 0,
      usuarios: [],
    }).expect(500);
  });
});

describe("GET /challenges",() => {
  it("Se obtienen los datos de los retos", async () => {
    const response = await request(app).get("/challenges?nombre=Reto 1").expect(200);
  });
  it("Se busca por el id unico", async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).get("/challenges/" + id).expect(200);
  });
  it("No debería encontrar un reto con un nombre aleatorio", async () => {
    const response = await request(app).get("/challenges?nombre=algo").expect(404);
  });
  it("No debería encontrar un reto con un id aleatorio", async () => {
    let id = "5f9b3b3b3b3b3b3b3b3b3b3b";
    const response = await request(app).get("/challenges/" + id).expect(404);
  });
  it("Se envía a la base de datos un id que no existe", async () => {
    const response = await request(app).get("/challenges/645a12fc4cb841c18221aaaa").expect(404);
  });
});

describe("PATCH /challenges", () => {
  it("Se actualiza un reto", async () => {
    const response = await request(app).patch("/challenges?nombre=Reto 1").send({
      nombre: "Reto 1",
    }).expect(200);
    expect(response.body.nombre).to.equal("Reto 1");
  });
  it("Se actualiza un reto por el id unico", async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).patch("/challenges/" + id).send({
      nombre: "Reto 1",
    }).expect(200);
    expect(response.body.nombre).to.equal("Reto 1");
  });
  it("No se debe actualizar un campo inexistente", async () => {
    const response = await request(app).patch("/challenges?nombre=Reto 1").send({
      campo_inexistente: "valor",
    }).expect(400);
  });
  it("Se fuerza el error 500", async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).patch("/challenges/" + id + 0).send({
      nombre: "Reto 1",
    }).expect(500);
  });
  it("Se pide que proporcione un nombre", async () => {
    const response = await request(app).patch("/challenges").send({
      nombre: "Reto 1",
    }).expect(400);
  });
  it("Se intenta hacer una modificacion no permitida", async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).patch("/challenges/" + id).send({
      campo_inexistente: "valor",
    }).expect(400);
  });
});


describe('DELETE /challenges/:id', () => {
  it('Se borra un reto', async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).delete('/challenges/' + id).send().expect(200);
    const reto = await Reto.findById(id);
    expect(reto).to.be.null;
  });
  it('Se puede borrar el reto por el id unico', async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).delete('/challenges/' + id).send().expect(200);
    const reto = await Reto.findById(id);
    expect(reto).to.be.null;
  });
  it('Fuerzo un error 404',async () => {
    const response = await request(app).delete('/challenges?nombre=pepe').send().expect(404);
  });
  it('Se debe proporcionar un nombre', async () => {
    const response = await request(app).delete('/challenges').send().expect(400);
  });
  it('Fuerzo un error 400',async () => {
    const id = (await Reto.findOne({nombre: "Reto 1"}))!._id;
    const response = await request(app).delete('/challenges/' + id + 0).send().expect(500);
  });
  it('No se borra un reto que no existe', async () => {
    const response = await request(app).delete('/challenges?nombre=pepe').send().expect(404);
  });
});
  