import express from 'express';
import { Grupo } from './../models/grupo.js';

export const grupoRouter = express.Router();

grupoRouter.use(express.json());

grupoRouter.post('/groups', (req, res) => {
  const grupo = new Grupo(req.body);
  grupo.save().then((grupo) => {
    res.status(200).send(grupo);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

grupoRouter.get('/groups', (req, res) => {
  const filter = req.query.nombre? {nombre: req.query.nombre.toString()} : {};
  Grupo.find(filter).then((grupo) => {
    if(grupo.length !== 0) {
      res.send(grupo);
    } else {
      res.status(404).send();
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

grupoRouter.get('/groups/:id', (req, res) => {
  Grupo.findById(req.params.id).then((grupo) => {
    if(!grupo) {
      res.status(404).send();
    } else {
      res.send(grupo);
    }
  }).catch((error) => {
    res.status(500).send(error);
  });
});

grupoRouter.patch('/groups', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    const allowedUpdates = ['nombre', 'id', 'participantes', 'estadisticas', 'clasificacion', 'rutas_favoritas', 'historico_rutas'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Esta modificacion no esta permitida',
      });
    } else {
      Grupo.findOneAndUpdate({nombre: req.query.nombre.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((grupo) => {
        if (!grupo) {
          res.status(404).send();
        } else {
          res.send(grupo);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

grupoRouter.patch('/groups/:id', (req, res) => {
    const allowedUpdates = ['nombre', 'id', 'participantes', 'estadisticas', 'clasificacion', 'rutas_favoritas', 'historico_rutas'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Esta modificacion no esta permitida',
    });
  } else {
    Grupo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).then((grupo) => {
      if (!grupo) {
        res.status(404).send();
      } else {
        res.send(grupo);
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

grupoRouter.delete('/groups', (req, res) => {
  if (!req.query.nombre) {
    res.status(400).send({
      error: 'Se debe proporcionar un nombre',
    });
  } else {
    Grupo.findOneAndDelete({nombre: req.query.nombre.toString()}).then((grupo) => {
      if (!grupo) {
        res.status(404).send();
      } else {
        res.send(grupo);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

grupoRouter.delete('/groups/:id', (req, res) => {
  Grupo.findByIdAndDelete(req.params.id).then((grupo) => {
    if (!grupo) {
      res.status(404).send();
    } else {
      res.send(grupo);
    }
  }).catch(() => {
    res.status(400).send();
  });
});

