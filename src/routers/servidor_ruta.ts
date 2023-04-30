import express from 'express';
import { Ruta } from './../models/ruta.js';

export const rutaRouter = express.Router();


rutaRouter.use(express.json());

rutaRouter.post('/tracks', (req, res) => {
  const ruta = new Ruta(req.body);
  ruta.save().then((ruta) => {
    res.status(200).send(ruta);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

rutaRouter.get('/tracks', (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};

  Ruta.find(filter).then((rutas) => {
    if(rutas.length !== 0) {
      res.send(rutas);
    } else {
      res.status(404).send();
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

rutaRouter.get('/tracks/:id', (req, res) => {
  Ruta.findById(req.params.id).then((ruta) => {
    if(!ruta) {
      res.status(404).send();
    } else {
      res.send(ruta);
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

rutaRouter.patch('/tracks', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    const allowedUpdates = ['nombre', 'calificacion', 'desnivel', 'longitud', 'geolocalizacion_inicio', 'geolocation_fin', 'usuarios', 'tipo'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Esta modificacion no esta permitida',
      });
    } else {
      Ruta.findOneAndUpdate({nombre: req.query.nombre.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((ruta) => {
        if (!ruta) {
          res.status(404).send();
        } else {
          res.send(ruta);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

rutaRouter.patch('/tracks/:id', (req, res) => {
  const allowedUpdates = ['nombre', 'calificacion', 'desnivel', 'longitud', 'geolocalizacion_inicio', 'geolocation_fin', 'usuarios', 'tipo'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } else {
    Ruta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).then((ruta) => {
      if (!ruta) {
        res.status(404).send();
      } else {
        res.send(ruta);
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

rutaRouter.delete('/tracks', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    Ruta.findOneAndDelete({nombre: req.query.nombre.toString()}).then((ruta) => {
      if (!ruta) {
        res.status(404).send();
      } else {
        res.send(ruta);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

rutaRouter.delete('/tracks/:id', (req, res) => {
  Ruta.findByIdAndDelete(req.params.id).then((ruta) => {
    if (!ruta) {
      res.status(404).send();
    } else {
      res.send(ruta);
    }
  }).catch(() => {
    res.status(400).send();
  });
});


