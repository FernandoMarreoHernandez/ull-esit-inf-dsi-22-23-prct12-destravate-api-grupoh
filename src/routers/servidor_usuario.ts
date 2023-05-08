import express from 'express';
import { Usuario } from './../models/usuario.js';
import { Grupo } from './../models/grupo.js';
import { Ruta } from './../models/ruta.js';
import {Reto} from './../models/reto.js';

export const usuarioRouter = express.Router();


usuarioRouter.use(express.json());

usuarioRouter.post('/users', async (req, res) => {
  const usuario = new Usuario(req.body);
  try {
    await usuario.save();
    return res.status(201).send(usuario);
  } catch (error) {
    return res.status(500).send(error);
  }
});

usuarioRouter.get('/users', async (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  try {
    const usuarios = await Usuario.find(filter);
    if(usuarios.length !== 0) {
      return res.send(usuarios);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

usuarioRouter.get('/users/:id', async(req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).send({
        error: "El usuario no se encuentra"
      });
    }
    return res.send(usuario);
  } catch (error) {
    return res.status(500).send(error);
  }
});

usuarioRouter.patch('/users', async (req, res) => {
  if (!req.query.nombre) {
    return res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  }
  const allowedUpdates = ['nombre', 'actividad', 'rutas_favoritas', 'retos_activos', 'amigos', 'grupos', 'estadisticas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } 
  try {
    const usuario = await Usuario.findOneAndUpdate({
      nombre: req.query.nombre.toString()
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (usuario) {
      return res.send(usuario);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

usuarioRouter.patch('/users/:id', async (req, res) => {
  const allowedUpdates = ['nombre', 'actividad', 'rutas_favoritas', 'retos_activos', 'amigos', 'grupos', 'estadisticas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const usuario = await Usuario.findByIdAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (usuario) {
      return res.send(usuario);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
  
});

usuarioRouter.delete('/users', async (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    try {
      const usuario = await Usuario.findOne({nombre: req.query.nombre.toString()});
      if (!usuario) {
        return res.status(404).send();
      }
      try {
        await Usuario.updateMany({}, {$pull: {amigos: usuario._id}});
      } catch (error) {}

      try {
        await Usuario.updateMany({}, {$pull: {grupos: usuario._id}});
      } catch (error) {}

      try {
        await Ruta.updateMany({}, {$pull: {usuarios: usuario._id}});
      } catch (error) {}

      try {
        await Grupo.updateMany({}, {$pull: {participantes: usuario._id}});
      } catch (error) {}

      try {
        await Grupo.updateMany({}, {$pull: {clasificacion: usuario._id}});
      } catch (error) {}

      try {
        await Reto.updateMany({}, {$pull: {usuarios: usuario._id}});
      } catch (error) {}

      const usuario_final = await Usuario.findOneAndDelete({nombre: req.query.nombre.toString()});
      return res.status(200).send(usuario_final);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
});


usuarioRouter.delete('/users/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).send();
    }
    try {
      await Usuario.updateMany({}, {$pull: {amigos: usuario._id}});
    } catch (error) {}

    try {
      await Usuario.updateMany({}, {$pull: {grupos: usuario._id}});
    } catch (error) {}

    try {
      await Ruta.updateMany({}, {$pull: {usuarios: usuario._id}});
    } catch (error) {}

    try {
      await Grupo.updateMany({}, {$pull: {participantes: usuario._id}});
    } catch (error) {}

    try {
      await Grupo.updateMany({}, {$pull: {clasificacion: usuario._id}});
    } catch (error) {}

    try {
      await Reto.updateMany({}, {$pull: {usuarios: usuario._id}});
    } catch (error) {}
    const usuario_final = await Usuario.findByIdAndDelete(req.params.id);
    return res.status(200).send(usuario_final);
  } catch (error) {
    return res.status(400).send(error);
  }
});


