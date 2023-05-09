import request from 'supertest';
import {app} from '../../src/app.js';
import { expect } from 'chai';
import { Grupo } from '../../src/models/grupo.js';

const primerGrupo = {
  id: 1,
  nombre: 'Grupo 1',
  participantes: [],
  estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
  clasificacion: [],
  rutas_favoritas: [ ],
  historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
};


const segundoGrupo = {
  id: 2,
  nombre: 'Grupo 2',
  participantes: [],
  estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
  clasificacion: [],
  rutas_favoritas: [ ],
  historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
};

beforeEach(async() => {
  await Grupo.deleteMany({});
  await new Grupo(primerGrupo).save();
  await new Grupo(segundoGrupo).save();
});

describe('POST / groups', () => {
  it("Se crea un grupo", async () => {
    const response = await request(app).post('/groups').send({
      id: 3,
      nombre: 'Grupo 3',
      participantes: [],
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
      clasificacion: [],
      rutas_favoritas: [ ],
      historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
    }).expect(201);
    expect(response.body).to.deep.include({
      id: 3,
      nombre: 'Grupo 3',
      participantes: [],
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
      clasificacion: [],
      rutas_favoritas: [ ],
      historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
    });

    const segundogrupo = await Grupo.findById(response.body._id);
    expect(segundogrupo).to.not.be.null;
    expect(segundogrupo!.nombre).to.equal('Grupo 3');
    const response2 = await request(app).post('/groups').send({
      id: 3,
      nombre: 'Grupo 4',
      participantes: [],
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
      clasificacion: [],
      rutas_favoritas: [ ],
      historico_rutas: [ [ [ 6, 4, 2022 ], [ 1, 30 ] ] ],
    }).expect(500);
  });
});

describe('GET / groups', () => {
  it("Se obtienen todos los grupos", async () => {
    const response = await request(app).get('/groups?nombre=Grupo 1').expect(200);
  });
  it("Se busca por el id unico", async () => {
    const id = (await Grupo.findOne({nombre: 'Grupo 1'}))!._id;
    const response = await request(app).get(`/groups/${id}`).expect(200);
  });
  it("No deberia encontrar ningun grupo con nombre grupo100", async () => {
    const response = await request(app).get('/groups?nombre=Grupo100').expect(404);
  });
  it("No deberia encontrar ningun grupo con otro id", async () => {
    let id = (await Grupo.findOne({nombre: 'Grupo 1'}))!._id;
    const response = await request(app).get(`/groups/` + id + 0).expect(500);
  });
  it("Se envia un id que no existe", async () => {
    const response = await request(app).get(`/groups/60f8b9e9b1a6b7d6c4c4c4c4`).expect(404);
  });
});

describe('PATCH / groups', () => {
  it("Se actualiza un grupo", async () => {
    const response = await request(app).patch('/groups?nombre=Grupo 1').send({
      estadisticas: [ [ 20, 20 ], [ 30, 40 ], [ 50, 60 ] ],
    }).expect(200);
    expect(response.body.estadisticas).to.deep.equal([ [ 20, 20 ], [ 30, 40 ], [ 50, 60 ] ]);
  });
});


