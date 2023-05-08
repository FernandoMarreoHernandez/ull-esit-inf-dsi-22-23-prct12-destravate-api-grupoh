import  request  from "supertest";
import { app } from "../../src/app.js";
import { Usuario } from "../../src/models/usuario.js";
import { expect } from "chai";

beforeEach(async () => {
  await Usuario.deleteMany();
});

describe('POST /users', () => {
  it('Se crea un usuario', async () => {
    const response = await request(app).post('/users').send({
      id: 55,
      nombre: "Pablo",
      rutas_favoritas: [],
      retos_activos: [],
      amigos: [],
      grupos: [],
      estadisticas: [[10,20],[30,40],[50,60]],
      actividad: "correr",
      historico_rutas: [[[6,4,2022],[1,30]]],
    }).expect(201);

    expect(response.body).to.deep.include({
      id: 55,
      nombre: "Pablo",
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
    expect(segundoUsuario!.nombre).to.equal('Pablo');
  });
});
