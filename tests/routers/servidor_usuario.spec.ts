import  request  from "supertest";
import { app } from "../../src/app.js";
import { Usuario } from "../../src/models/usuario.js";
import { expect } from "chai";

const primerUsuario = {
  id: 55,
  nombre: "Pablo",
  rutas_favoritas: [ ],
  retos_activos: [ ],
  amigos: [ ],
  grupos: [ ],
  estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
  actividad: "correr",
  historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
};

const segundoUsuario = {
  id: 14,
  nombre: "Juan",
  rutas_favoritas: [ ],
  retos_activos: [ ],
  amigos: [ ],
  grupos: [ ],
  estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
  actividad: "correr",
  historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
};

beforeEach(async () => {
  await Usuario.deleteMany();
  await new Usuario(primerUsuario).save();
  await new Usuario(segundoUsuario).save();
});

describe('POST /users', () => {
  it('Se crea un usuario', async () => {
    const response = await request(app).post('/users').send({
      id: 56,
      nombre: "Antonio",
      rutas_favoritas: [],
      retos_activos: [],
      amigos: [],
      grupos: [],
      estadisticas: [[10,20],[30,40],[50,60]],
      actividad: "correr",
      historico_rutas: [[[6,4,2022],[1,30]]],
    }).expect(201);

    expect(response.body).to.deep.include({
      id: 56,
      nombre: "Antonio",
      rutas_favoritas: [ ],
      retos_activos: [ ],
      amigos: [ ],
      grupos: [ ],
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
      actividad: "correr",
      historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
    });

    const segundoUsuario = await Usuario.findById(response.body._id);
    expect(segundoUsuario).to.not.be.null;
    expect(segundoUsuario!.nombre).to.equal('Antonio');
    expect(segundoUsuario!.id).to.equal(56);
    expect(segundoUsuario!.rutas_favoritas).to.deep.equal([]);
    expect(segundoUsuario!.retos_activos).to.deep.equal([]);
    expect(segundoUsuario!.amigos).to.deep.equal([]);
    expect(segundoUsuario!.grupos).to.deep.equal([]);
    expect(segundoUsuario!.estadisticas).to.deep.equal([[10,20],[30,40],[50,60]]);
    expect(segundoUsuario!.actividad).to.equal("correr");
    expect(segundoUsuario!.historico_rutas).to.deep.equal([[[6,4,2022],[1,30]]]);
    const response1 = await request(app).post('/users').send({
      id: 56,
      nombre: "Julito",
      rutas_favoritas: [],
      retos_activos: [],
      amigos: [],
      grupos: [],
      estadisticas: [[10,20],[30,40],[50,60]],
      actividad: "correr",
      historico_rutas: [[[6,4,2022],[1,30]]],
    }).expect(500);
  });
});

describe('GET /users', () => {
  it('Se obtienen los datos de los usuarios', async () => {
    const response = await request(app).get('/users?nombre=Pablo').send().expect(200);
  });
  it("Se busca por el id único", async () => {
    const id = (await Usuario.findOne({nombre: "Pablo"}))!._id;
    const response = await request(app).get('/users/' + id).send().expect(200);
  });
  it('No debería encontrar un usuario con el nombre pepe', async () => {
    const response = await request(app).get('/users?nombre=pepe').send().expect(404);
  });
  it('No debería encontrar un usuario con otro id', async () => {
    let id = (await Usuario.findOne({nombre: "Pablo"}))!._id;
    const response = await request(app).get('/users/' + id + 0).send().expect(500);
  });
  it ('se envia a la base de datos un id que no existe', async () => {
    const response = await request(app).get('/users/645a12fc4cb841c18221aaaa').send().expect(404);
  });
});

describe('PATCH /users', () => {
  it('Se actualiza un usuario', async () => {
    const response = await request(app).patch('/users?nombre=Pablo').send({
      actividad: "bicicleta",
    }).expect(200);
    expect(response.body.actividad).to.equal("bicicleta");
  });
  it('Se puede actualizar el usuario por el id unico', async () => {
    const id = (await Usuario.findOne({nombre: "Pablo"}))!._id;
    const response = await request(app).patch('/users/' + id).send({
    actividad: "correr",
  }).expect(200);
  expect(response.body.actividad).to.equal("correr");
});
  it("No se debe actualizar el id" , async () => {
    const response = await request(app).patch('/users?nombre=Pablo').send({
      id: 56,
    }).expect(400);
  });
  it("No se debe actualizar un campo inexistente", async () => {
    const response = await request(app).patch('/users?nombre=Pablo').send({
      campoInexistente: "valor",
    }).expect(400);
  });
  it("Se fuerza el error 500",async () =>{
    const id = (await Usuario.findOne({nombre: "Pablo"}))!._id;
    const response = await request(app).patch('/users/' + id + 0).send({
      actividad: "correr",
    }).expect(500);
  });
  it("se pide al usuario que proporcione un nombre", async () => {
    const response = await request(app).patch('/users').send({
      actividad: "correr",
    }).expect(400);
  });
  it ("Se intenta hacer una modificacion no permitida", async () => {
    const id= (await Usuario.findOne({nombre: "Pablo"}))!._id;
    const response = await request(app).patch('/users/' + id).send({
      campoInexistente: "valor",
    }).expect(501);
  });
});

describe('DELETE /users', () => {
  it('Se borra un usuario', async () => {
    const response = await request(app).delete('/users?nombre=Pablo').send().expect(200);
    const usuario = await Usuario.findOne({nombre: "Pablo"});
    expect(usuario).to.be.null;
  });
  it('Se puede borrar el usuario por el id unico', async () => {
    const id = (await Usuario.findOne({nombre: "Juan"}))!._id;
    const response = await request(app).delete('/users/' + id).send().expect(200);
    const usuario = await Usuario.findOne({nombre: "Juan"});
    expect(usuario).to.be.null;
  });
  it('Fuerzo un error 404',async () => {
    const response = await request(app).delete('/users?nombre=pepe').send().expect(404);
  });
  it('Se debe proporcionar un nombre', async () => {
    const response = await request(app).delete('/users').send().expect(400);
  });
  it('Fuerzo un error 400',async () => {
    const id = (await Usuario.findOne({nombre: "Juan"}))!._id;
    const response = await request(app).delete('/users/' + id + 0).send().expect(400);
  });
  it('Fuerzo un error 404', async () => {
    let id = "5f9b3b9b4b0e7b1a3c9b3b9b";
    const response = await request(app).delete('/users/' + id ).send().expect(404);
  });
  it('No se borra un usuario que no existe', async () => {
    const response = await request(app).delete('/users?nombre=pepe').send().expect(404);
  });
});
