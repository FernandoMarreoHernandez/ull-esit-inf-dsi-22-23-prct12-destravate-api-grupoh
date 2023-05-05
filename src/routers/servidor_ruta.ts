import express from 'express';
import { Ruta } from './../models/ruta.js';
import { Usuario } from './../models/usuario.js';
import { Reto } from './../models/reto.js';
import { Grupo } from './../models/grupo.js';

export const rutaRouter = express.Router();


rutaRouter.use(express.json());

rutaRouter.post('/tracks', async(req, res) => {
  const usuarios = req.body.usuarios;
  try {
    for (const usuario of usuarios) {
      await Usuario.findById(usuario);
    }
    const ruta = new Ruta(req.body);
    await ruta.save();
    res.status(201).send(ruta);
  } catch (error) {
    return res.status(500).send(error);
  }
});

rutaRouter.get('/tracks', async (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  try {
    const rutas = await Ruta.find(filter);
    if(rutas.length !== 0) {
      return res.send(rutas);
    }
    return res.status(404).send();
  }catch (error) {
    return res.status(500).send(error);
  }
});

rutaRouter.get('/tracks/:id', async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) {
      return res.status(404).send({
        error: "La ruta no se encuentra"
      });
    }
    return res.send(ruta);
  } catch (error) {
    return res.status(500).send(error);
  }
});

rutaRouter.patch('/tracks', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  }
  const allowedUpdates = ['nombre', 'calificacion', 'desnivel', 'longitud', 'geolocalizacion_inicio', 'geolocation_fin', 'usuarios', 'tipo'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const ruta = await Ruta.findOneAndUpdate({
      nombre: req.query.nombre.toString()
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (ruta) {
      return res.send(ruta);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

rutaRouter.patch('/tracks/:id', async (req, res) => {
  const allowedUpdates = ['nombre', 'calificacion', 'desnivel', 'longitud', 'geolocalizacion_inicio', 'geolocation_fin', 'usuarios', 'tipo'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } 
  try {
    const ruta = await Ruta.findByIdAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ruta) {
      res.status(404).send();
    }
    res.send(ruta);
  }catch(error) {
    res.status(500).send(error);
  }
});

rutaRouter.delete('/tracks', async (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    try {
      const ruta = await Ruta.findOne({nombre: req.query.nombre.toString()});
      if (!ruta) {
        res.status(404).send();
      }
      try {
        await Usuario.updateMany({}, {$pull: {rutas_favoritas: ruta._id}});
      }catch (error) {}
      try {
        await Grupo.updateMany({}, {$pull: {rutas_favoritas: ruta._id}});
      }catch (error) {}
      try {
        await Reto.updateMany({}, {$pull: {rutas: ruta._id}});
      }catch (error) {}
      const ruta_final = await Ruta.findOneAndDelete({nombre: req.query.nombre.toString()});
      return res.status(200).send(ruta_final);
    }catch (error) {
      return res.status(500).send(error);
    }
  }

});

rutaRouter.delete('/tracks/:id', async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) {
      res.status(404).send();
    }
    try {
      await Usuario.updateMany({}, {$pull: {rutas_favoritas: ruta._id}});
    }catch (error) {}
    try {
      await Grupo.updateMany({}, {$pull: {rutas_favoritas: ruta._id}});
    }catch (error) {}
    try {
      await Reto.updateMany({}, {$pull: {rutas: ruta._id}});
    }catch (error) {}
    const ruta_final = await Ruta.findByIdAndDelete(req.params.id);
    return res.status(200).send(ruta_final);
  }catch (error) {
    return res.status(500).send(error);
  }
});


