import express from 'express';
import { Grupo } from './../models/grupo.js';
import { Usuario } from './../models/usuario.js';
import { Ruta } from './../models/ruta.js';
import { Reto } from './../models/reto.js';

export const grupoRouter = express.Router();

grupoRouter.use(express.json());

/**
 * funcion para añadir un grupo
 */
grupoRouter.post('/groups', async (req, res) => {
  const grupo = new Grupo(req.body);
  try {
    await grupo.save();
    return res.status(201).send(grupo);
  }
  catch(error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para mostrar los grupos
 */
grupoRouter.get('/groups', async (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  try {
    const grupos = await Grupo.find(filter);
    if(grupos.length !== 0) {
      return res.send(grupos);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para mostrar un grupo en concreto
 */
grupoRouter.get('/groups/:id', async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id);
    if (!grupo) {
      return res.status(404).send({
        error: 'El grupo no se encuentra',
      });
    }
    return res.send(grupo);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para modificar un grupo
 */
grupoRouter.patch('/groups', async (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  }
  const allowedUpdates = ['nombre', 'id', 'participantes', 'estadisticas', 'clasificacion', 'rutas_favoritas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const grupo = await Grupo.findOneAndUpdate({
      nombre: req.query.nombre.toString()
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!grupo) {
      return res.status(404).send();
    }
    return res.send(grupo);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para modificar un grupo en concreto segun su id
 */
grupoRouter.patch('/groups/:id', async (req, res) => {
  const allowedUpdates = ['nombre', 'id', 'participantes', 'estadisticas', 'clasificacion', 'rutas_favoritas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const grupo = await Grupo.findByIdAndUpdate({
      _id: req.params.id,
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!grupo) {
      return res.status(404).send();
    }
    return res.send(grupo);
  }catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para borrar un grupo por su nombre
 */
grupoRouter.delete('/groups', async(req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    try {
      const grupo = await Grupo.findOneAndDelete({nombre: req.query.nombre.toString()});
      if(!grupo) {
        return res.status(404).send();
      }
      const grupo_final = await Grupo.findOneAndDelete({nombre: req.query.nombre.toString()});
      return res.status(200).send(grupo_final);
    }catch (error) {
      return res.status(500).send(error);
    }
  }
});

/**
 * funcion para borrar un grupo por su id
 */
grupoRouter.delete('/groups/:id', async (req, res) => {
  try {
    const grupo = Grupo.findById(req.params.id);
    if (!grupo) {
      return res.status(404).send();
    }
    const grupo_final = await Grupo.findByIdAndDelete(req.params.id);
    return res.status(200).send(grupo_final);
  }catch (error) {
    return res.status(500).send(error);
  }
});

