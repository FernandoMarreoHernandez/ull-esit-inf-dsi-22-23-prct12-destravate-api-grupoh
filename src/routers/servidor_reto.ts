import express from 'express';
import { Reto } from './../models/reto.js';
import { Usuario } from './../models/usuario.js';
import { Ruta } from './../models/ruta.js';
import { Grupo } from './../models/grupo.js';

export const retoRouter = express.Router();

retoRouter.use(express.json());

/**
 * funcion para añadir un reto
 */
retoRouter.post('/challenges', async(req, res) => {
  const reto = new Reto(req.body);
  try {
    await reto.save();
    return res.status(201).send(reto);
  }catch (error) {
    return res.status(500).send(error);
  }


});

/**
 * funcion para mostrar los retos
 */
retoRouter.get('/challenges', async (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  try {
    const retos = await Reto.find(filter);
    if(retos.length !== 0) {
      return res.send(retos);
    }
    return res.status(404).send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para mostrar un reto en concreto
 */
retoRouter.get('/challenges/:id', async(req, res) => {
  try {
    const reto = await Reto.findById(req.params.id);
    if (!reto) {
      return res.status(404).send({
        error: "El reto no se encuentra"
      });
    }
    return res.send(reto);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para modificar un reto en concreto por nombre
 */
retoRouter.patch('/challenges', async (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  }
  const allowedUpdates = ['nombre', 'id', 'rutas', 'tipo', 'kilometros', 'usuarios'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const reto = await Reto.findOneAndUpdate({
      nombre: req.query.nombre.toString()
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reto) {
      return res.status(404).send();
    }
    return res.send(reto);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para modificar un reto en concreto por id
 */
retoRouter.patch('/challenges/:id', async (req, res) => {
  const allowedUpdates = ['nombre', 'id', 'rutas', 'tipo', 'kilometros', 'usuarios'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  }
  try {
    const reto = await Reto.findByIdAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reto) {
      return res.status(404).send();
    }
    return res.send(reto);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * funcion para eliminar un reto en concreto por nombre
 */
retoRouter.delete('/challenges', async (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    try {
      const reto = await Reto.findOne({nombre: req.query.nombre.toString()});
      if (!reto) {
        return res.status(404).send();
      }
      try {
        await Usuario.updateMany({}, {$pull: {retos_activos: reto._id}});
      } catch {}
      const reto_final = await Reto.findOneAndDelete({nombre: req.query.nombre.toString()});
      return res.send(reto_final);
    }catch (error) {
      return res.status(500).send(error);
    }
  }
});

/**
 * funcion para eliminar un reto en concreto por id
 */
retoRouter.delete('/challenges/:id', async (req, res) => {
  try {
    const reto = await Reto.findById(req.params.id);
    if (!reto) {
      return res.status(404).send();
    }
    try {
      await Usuario.updateMany({}, {$pull: {retos_activos: reto._id}});
    } catch {}
    const reto_final = await Reto.findByIdAndDelete(req.params.id);
    return res.send(reto_final);
  }catch (error) {
    return res.status(500).send(error);
  }
});


