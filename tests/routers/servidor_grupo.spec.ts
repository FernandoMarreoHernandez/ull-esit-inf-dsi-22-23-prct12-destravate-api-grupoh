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
  it("Se puede actualizar el grupo por el id unico", async () => {
    const id = (await Grupo.findOne({nombre: 'Grupo 1'}))!._id;
    const response = await request(app).patch(`/groups/${id}`).send({
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
    }).expect(200);
    expect(response.body.estadisticas).to.deep.equal([ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ]);
  });
  it("No se debe actualizar un campo inexistentes", async () => {
    const response = await request(app).patch('/groups?nombre=Grupo 1').send({
      campoInexistente: 'valor',
    }).expect(400);
  });
  it("Se fuerza el error 500", async () => {
    const id = (await Grupo.findOne({nombre: 'Grupo 1'}))!._id;
    const response = await request(app).patch(`/groups/${id}` + 0).send({
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
    }).expect(500);
  });
  it("Se pide al usuario que proporciones un nombre", async () => {
    const response = await request(app).patch('/groups').send({
      estadisticas: [ [ 10, 20 ], [ 30, 40 ], [ 50, 60 ] ],
    }).expect(400);
  });
  it("Se intenta hacer una modificación no permitida", async () => {
    const id = (await Grupo.findOne({nombre: 'Grupo 1'}))!._id;
    const response = await request(app).patch(`/groups/${id}`).send({
      campoInexistente: 'valor',
    }).expect(400);
  });
});

describe('DELETE /groups', () => {
  it('Se borra un grupo', async () => {
    const response = await request(app).delete('/groups?nombre=Grupo 2').send().expect(200);
    const grupo = await Grupo.findOne({nombre: "Grupo 2"});
    expect(grupo).to.be.null;
  });
  it('Se puede borrar el grupo por el id unico', async () => {
    const id = (await Grupo.findOne({nombre: "Grupo 2"}))!._id;
    const response = await request(app).delete(`/groups/${id}`).send().expect(200);
    const grupo = await Grupo.findOne({nombre: "Grupo 2"});
    expect(grupo).to.be.null;
  });
  it('Fuerzo un error 404',async () => {
    const response = await request(app).delete('/groups?nombre=pepe').send().expect(404);
  });
  it('Se debe proporcionar un nombre', async () => {
    const response = await request(app).delete('/groups').send().expect(400);
  });
  it('Fuerzo un error 400',async () => {
    const id = (await Grupo.findOne({nombre: "Grupo 2"}))!._id;
    const response = await request(app).delete(`/groups/${id}` + 0).send().expect(500);
  });
  it('No se borra un grupo que no existe', async () => {
    const response = await request(app).delete('/groups?nombre=Grupo 100').send().expect(404);
  });
});


