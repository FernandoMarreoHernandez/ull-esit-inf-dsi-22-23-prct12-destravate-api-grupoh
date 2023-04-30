import express from 'express';
import { Reto } from './../models/reto.js';

export const retoRouter = express.Router();

retoRouter.use(express.json());

retoRouter.post('/challenges', (req, res) => {
  const reto = new Reto(req.body);
  reto.save().then((reto) => {
    res.status(200).send(reto);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

retoRouter.get('/challenges', (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  Reto.find(filter).then((reto) => {
    if(reto.length !== 0) {
      res.send(reto);
    } else {
      res.status(404).send();
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

retoRouter.get('/challenges/:id', (req, res) => {
  Reto.findById(req.params.id).then((reto) => {
    if(!reto) {
      res.status(404).send();
    } else {
      res.send(reto);
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

retoRouter.patch('/challenges', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    const allowedUpdates = ['nombre', 'id', 'rutas', 'tipo', 'kilometros', 'usuarios'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Esta modificacion no esta permitida',
      });
    } else {
      Reto.findOneAndUpdate({nombre: req.query.nombre.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((reto) => {
        if (!reto) {
          res.status(404).send();
        } else {
          res.send(reto);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

retoRouter.patch('/challenges/:id', (req, res) => {
  const allowedUpdates = ['nombre', 'id', 'rutas', 'tipo', 'kilometros', 'usuarios'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } else {
    Reto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).then((reto) => {
      if (!reto) {
        res.status(404).send();
      } else {
        res.send(reto);
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

retoRouter.delete('/challenges', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    Reto.findOneAndDelete({nombre: req.query.nombre.toString()}).then((reto) => {
      if (!reto) {
        res.status(404).send();
      } else {
        res.send(reto);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

retoRouter.delete('/challenges/:id', (req, res) => {
  Reto.findByIdAndDelete(req.params.id).then((reto) => {
    if (!reto) {
      res.status(404).send();
    } else {
      res.send(reto);
    }
  }).catch(() => {
    res.status(400).send();
  });
});


