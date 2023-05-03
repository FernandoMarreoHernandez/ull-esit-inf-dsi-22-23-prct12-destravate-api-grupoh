import express from 'express';
import { Usuario } from './../models/usuario.js';
import { Grupo } from './../models/grupo.js';
import { Ruta } from './../models/ruta.js';
import {Reto} from './../models/reto.js';

export const usuarioRouter = express.Router();


usuarioRouter.use(express.json());

usuarioRouter.post('/users', (req, res) => {
  const usuario = new Usuario(req.body);
  usuario.save().then((usuario) => {
    res.status(200).send(usuario);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

usuarioRouter.get('/users', (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  Usuario.find(filter).then((usuario) => {
    if(usuario.length !== 0) {
      res.send(usuario);
    } else {
      res.status(404).send();
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

usuarioRouter.get('/users/:id', (req, res) => {
  Usuario.findById(req.params.id).then((usuario) => {
    if(!usuario) {
      res.status(404).send();
    } else {
      res.send(usuario);
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

usuarioRouter.patch('/users', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    const allowedUpdates = ['nombre', 'actividad', 'rutas_favoritas', 'retos_activos', 'amigos', 'grupos', 'estadisticas', 'historico_rutas'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Esta modificacion no esta permitida',
      });
    } else {
      Usuario.findOneAndUpdate({nombre: req.query.nombre.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((usuario) => {
        if (!usuario) {
          res.status(404).send();
        } else {
          res.send(usuario);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

usuarioRouter.patch('/users/:id', (req, res) => {
  const allowedUpdates = ['nombre', 'actividad', 'rutas_favoritas', 'retos_activos', 'amigos', 'grupos', 'estadisticas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } else {
    Usuario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).then((usuario) => {
      if (!usuario) {
        res.status(404).send();
      } else {
        res.send(usuario);
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

usuarioRouter.delete('/users', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    Usuario.findOne({nombre: req.query.nombre.toString()}).then((usuario) => {
      if (!usuario) {
        res.status(404).send();
      } else {
        //hay que borrar del atributo amigos de todos los usuarios que lo tengan como amigo, lo que hay en el atributo amigo son los ids unicos
        return Usuario.updateMany({amigos: usuario._id}, {$pull: {amigos: usuario._id}}).then(() => {
          // hacer lo mismo con los grupos de amigos, propiedad de usuario
          return Usuario.updateMany({grupos: usuario._id}, {$pull: {grupos: usuario._id}}).then(() => {
            return Usuario.findByIdAndDelete(usuario._id).then((usuario) => {
              res.send(usuario);
            });
          });
        });
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

usuarioRouter.delete('/users/:id', (req, res) => {
  Usuario.findByIdAndDelete(req.params.id).then((usuario) => {
    if (!usuario) {
      res.status(404).send();
    } else {
      res.send(usuario);
    }
  }).catch(() => {
    res.status(400).send();
  });
});


