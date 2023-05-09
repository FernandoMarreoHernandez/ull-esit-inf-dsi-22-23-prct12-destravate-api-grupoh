import  request  from "supertest";
import { app } from "../../src/app.js";
import { expect } from "chai";
import { Ruta } from "../../src/models/ruta.js";

const PrimeraRuta = {
  id: 99,
  nombre: "Ruta por arafo",
  geolocalizacion_inicio: [ 99, 99 ],
  geolocalizacion_fin: [ 99, 99 ],
  longitud: 99,
  desnivel: 9,
  usuarios: [ ],
  tipo: "bicicleta",
  calificacion: 9
 };
const SegundaRuta = {
  id: 88,
  nombre: "Ruta por malpais",
  geolocalizacion_inicio: [ 88, 88 ],
  geolocalizacion_fin: [ 88, 88 ],
  longitud: 88,
  desnivel: 8,
  usuarios: [ ],
  tipo: "bicicleta",
  calificacion: 8
  };

 beforeEach(async () => {
  await Ruta.deleteMany({});
  await new Ruta(PrimeraRuta).save();
 });
 describe('POST/tracks', () => {
  it('Se crea una ruta', async () => {
    const response = await request(app).post('/tracks').send({
      id: 77,
      nombre: "Ruta por candelaria",
      geolocalizacion_inicio: [ 77, 77 ],
      geolocalizacion_fin: [ 77, 77 ],
      longitud: 77,
      desnivel: 7,
      usuarios: [ ],
      tipo: "bicicleta",
      calificacion: 9,
    }).expect(201);

    expect(response.body).to.deep.include({
      id: 77,
      nombre: "Ruta por candelaria",
      geolocalizacion_inicio: [ 77, 77 ],
      geolocalizacion_fin: [ 77, 77 ],
      longitud: 77,
      desnivel: 7,
      usuarios: [ ],
      tipo: "bicicleta",
      calificacion: 9,
    });

    const SegundaRuta = await Ruta.findById(response.body._id);
    expect(SegundaRuta).to.not.be.null;
    expect(SegundaRuta!.nombre).to.equal('Ruta por candelaria');
    expect(SegundaRuta!.id).to.equal(77);
    expect(SegundaRuta!.geolocalizacion_inicio).to.deep.equal([ 77, 77 ]);
    expect(SegundaRuta!.geolocalizacion_fin).to.deep.equal([ 77, 77 ]);
    expect(SegundaRuta!.longitud).to.equal(77);
    expect(SegundaRuta!.desnivel).to.equal(7);
    expect(SegundaRuta!.usuarios).to.deep.equal([]);
    expect(SegundaRuta!.tipo).to.equal("bicicleta");
    expect(SegundaRuta!.calificacion).to.equal(9);
    const response1 = await request(app).post('/tracks').send({
      id: 77,
      nombre: "Ruta por candelaria",
      geolocalizacion_inicio: [ 77, 77 ],
      geolocalizacion_fin: [ 77, 77 ],
      longitud: 77,
      desnivel: 7,
      usuarios: [ ],
      tipo: "bicicleta",
      calificacion: 9,
    }).expect(500);
  });
});

describe('GET/tracks', () => {
  it('Se obtienen los datos de las rutas', async () => {
    const response = await request(app).get('/tracks?nombre=Ruta por arafo').send().expect(200);
  });
  it("Se busca por el id único", async () => {
    const id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).get('/tracks/' + id).send().expect(200);
  });
  it('No debería encontrar una ruta con el nombre pepe', async () => {
    const response = await request(app).get('/tracks?nombre=pepe').send().expect(404);
  });
  it('No debería encontrar una ruta con otro id', async () => {
    let id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).get('/tracks/' + id + 0).send().expect(500);
  });
  it ('se envia a la base de datos un id que no existe', async () => {
    const response = await request(app).get('/tracks/645a12fc4cb841c18221aaaa').send().expect(404);
  });
});

describe('PATCH/tracks', () => {
  it ('Se actualiza una ruta', async () => {
    const response = await request(app).patch('/tracks?nombre=Ruta por arafo').send({
      calificacion: 5,
    }).expect(200);
    expect(response.body.calificacion).to.equal(5);
  });
  it ('Se puede actualizar la ruta por el id unico', async () => {
    const id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).patch('/tracks/' + id).send({
      calificacion: 5,
    }).expect(200);
    expect(response.body.calificacion).to.equal(5);
  });
  it ("No se debe actualizar el id" , async () => {
    const response = await request(app).patch('/tracks?nombre=Ruta por arafo').send({
      id: 56,
    }).expect(400);
  });
  it ("No se debe actualizar un campo inexistente", async () => {
    const response = await request(app).patch('/tracks?nombre=Ruta por arafo').send({
      campoInexistente: "valor",
    }).expect(400);
  });
  it ("Se fuerza el error 500",async () =>{
    const id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).patch('/tracks/' + id + 0).send({
      calificacion: 5,
    }).expect(500);
  });
  it ("se pide al usuario que proporcione un nombre", async () => {
    const response = await request(app).patch('/tracks').send({
      calificacion: 5,
    }).expect(400);
  });
  it ("Se intenta hacer una modificacion no permitida", async () => {
    const id= (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).patch('/tracks/' + id).send({
      campoInexistente: "valor",
    }).expect(400);
  });
});

describe('DELETE/tracks', () => {
  it('Se borra una ruta', async () => {
    const response = await request(app).delete('/tracks?nombre=Ruta por arafo').send().expect(200);
    const ruta = await Ruta.findOne({nombre: "Ruta por arafo"});
    expect(ruta).to.be.null;
  });
  it('Se puede borrar la ruta por el id unico', async () => {
    const id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).delete('/tracks/' + id).send().expect(200);
    const ruta = await Ruta.findOne({nombre: "Ruta por arafo"});
    expect(ruta).to.be.null;
  });
  it('Fuerzo un error 404',async () => {
    const response = await request(app).delete('/tracks?nombre=pepe').send().expect(404);
  });
  it('Se debe proporcionar un nombre', async () => {
    const response = await request(app).delete('/tracks').send().expect(400);
  });
  it('Fuerzo un error 400',async () => {
    const id = (await Ruta.findOne({nombre: "Ruta por arafo"}))!._id;
    const response = await request(app).delete('/tracks/' + id + 0).send().expect(500);
  });
  it('No se borra una ruta que no existe', async () => {
    const response = await request(app).delete('/tracks?nombre=pepe').send().expect(404);
  });
});
