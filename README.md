# Práctica API REST

[![Coveralls](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/coveralls.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/coveralls.yml)
[![Tests](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/node.js.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/node.js.yml)
[![Sonar-Cloud](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2223/ull-esit-inf-dsi-22-23-prct12-destravate-api-grupoh/actions/workflows/sonarcloud.yml)

## Introducción
En esta práctica se nos pide crear un API REST el cuál use como base de datos mongoose. También se nos pide usar async/await. Se nos pide realizar una api que permita realizar peticiones get, patch, post y delete, en este caso para una aplicación de información deportiva.

## Implementación

Para la implementación hemos dividido el proyecto en una carpeta para las interfaz y modelos, un fichero para cada cosa (ruta, usuario, grupo y reto), luego un directorio con los routers de cada uno de ellos y luego el fichero app y el index.API

### Implementación de las interfaces y modelos

#### Usuario

Para la interfaz y el modelo de usuario hemos creado lo siguiente:

```ts
export interface UsuarioDocumentInterface extends Document {
  id : number;
  nombre : string;
  rutas_favoritas : RutaDocumentInterface[];
  retos_activos : RetoDocumentInterface[];
  amigos : UsuarioDocumentInterface[];
  grupos: UsuarioDocumentInterface[][];
  estadisticas : number[][];
  actividad : "bicicleta" | "correr" | "bicicleta y correr";
  historico_rutas : number[][][];
}

const UsuarioSchema = new Schema<UsuarioDocumentInterface>({
  id : {
    type : Number,
    unique: true,
    required: true
  },
  nombre : {
    type : String,
    required: true,
    validate : (value : string) => {
      if(!value.match(/^[A-Z]/)){
        throw new Error('El nombre debe comezar por una letra mayúscula');
      }
    }
  },
  rutas_favoritas : {
    type : [Schema.Types.ObjectId],
    required: true,
    ref : 'Rutas',
    validate : async (value : SchemaType[]) => {
      for(const ruta of value){
        const rutacheck = await Ruta.findById(ruta);
        if(!rutacheck){
          throw new Error('La ruta no existe');
        }
      }
    }
  },
  retos_activos : {
    type : [Schema.Types.ObjectId],
    required: true,
    ref : 'Retos',
    validate : async (value : SchemaType[]) => {
      for(const reto of value){
        const retocheck = await Reto.findById(reto);
        if(!retocheck){
          throw new Error('El reto no existe');
        }
      }
    }
  },
  amigos : {
    type : [Schema.Types.ObjectId],
    required: true,
    ref : 'Usuarios',
    validate : async (value : SchemaType[]) => {
      for(const amigo of value){
        const amigocheck = await Usuario.findById(amigo);
        if(!amigocheck){
          throw new Error('no puedes añadir a un amigo que no existe');
        }
      }
    }
  },
  grupos : {
    type : [[Schema.Types.ObjectId]],
    required: true,
    ref : 'Usuarios',
    validate : async (value : SchemaType[][]) => {
      for(const grupo of value){
        for(const usuario of grupo){
          const usuariocheck = await Usuario.findById(usuario);
          if(!usuariocheck){
            throw new Error('no puedes añadir a un amigo que no existe');
          }
        }
      }
    }
  },
  estadisticas : {
    type : [[Number]],
    required: true
  },
  actividad : {
    type : String,
    required: true,
    enum : ["bicicleta", "correr", "bicicleta y correr"]
  },
  historico_rutas : {
    type : [[[Number]]],
    required : true,
    validate : (value : number[][][]) => {
      if(value.length > 0){
        if(value[0].length > 0){
          if(value[0].length != 2){
            throw new Error('El historico de rutas debe tener 2 arrays dentro del segundo array');
          }
          if(value[0][0][0] > 31 || value[0][0][0] < 1){
            throw new Error('El dia debe estar entre 1 y 31');
          }
          if(value[0][0][1] > 12 || value[0][0][1] < 1){
            throw new Error('El mes debe estar entre 1 y 12');
          }
          if(value[0][0][2] > 2023 || value[0][0][2] < 2000){
            throw new Error('El año debe estar entre 2000 y 2023');
          }
        }
      }
    }
  },
});

export const Usuario = model<UsuarioDocumentInterface>('Usuarios', UsuarioSchema);
```

En este código creamos la interfaz de usuario con los campos necesarios. En el modelo de usuario creamos el esquema de usuario con los campos necesarios y las validaciones necesarias. En este caso hemos usado el validate para comprobar que los campos de los arrays de ids de los amigos y grupos existen en la base de datos. También hemos usado el validate para comprobar que el historico de rutas tiene el formato correcto.

#### Ruta

La implementación de la interfaz y el modelo de ruta es la siguiente:

```ts
export interface RutaDocumentInterface extends Document {
  id : number;
  nombre : string;
  geolocalizacion_inicio : number[];
  geolocalizacion_fin : number[];
  longitud : number;
  desnivel : number;
  usuarios : UsuarioDocumentInterface[];
  tipo : "bicicleta" | "corriendo" | "bicicleta y corriendo";
  calificacion : number;
}

const RutaSchema = new Schema<RutaDocumentInterface>({
  id : {
    type : Number,
    unique: true,
    required: true
  },
  nombre : {
    type : String,
    required: true,
    unique : true,
    validate : (value : string) => {
      if(!value.match(/^[A-Z]/)){
        throw new Error('El nombre debe comezar por una letra mayúscula');
      }
    }
  },
  geolocalizacion_inicio : {
    type : [Number],
    required: true,
    validate : (value : number[]) => {
      if(value.length != 2){
        throw new Error('La geolocalización debe tener dos valores');
      }
    }
  },
  geolocalizacion_fin : {
    type : [Number],
    required: true,
    validate : (value : number[]) => {
      if(value.length != 2){
        throw new Error('La geolocalización debe tener dos valores');
      }
    }
  },
  longitud : {
    type : Number,
    required: true,
    validate : (value : number) => {
      if(value < 0){
        throw new Error('La longitud debe ser positiva');
      }
    }
  },
  desnivel : {
    type : Number,
    required: true,
    validate : (value : number) => {
      if(value < 0){
        throw new Error('El desnivel debe ser positivo');
      }
    }
  },
  usuarios : {
    type : [Schema.Types.ObjectId],
    required: true,
    ref : 'Usuario',
    validate : async (value : SchemaType[]) => {
      for(const usuario of value){
        const usuariocheck = await Usuario.findById(usuario);
        if(!usuariocheck){
          throw new Error('El usuario no existe');
        }
      }
    }
  },
  tipo : {
    type : String,
    required: true,
    validate : (value : string) => {
      if(value != 'bicicleta' && value != 'corriendo' && value != 'bicicleta y corriendo'){
        throw new Error('El tipo debe ser bicicleta, corriendo o bicicleta y corriendo');
      }
    }
  },
  calificacion:{
    type : Number,
    required: true,
    validate : (value : number) => {
      if(value < 0 || value > 10){
        throw new Error('La calificación debe ser un número entre 0 y 10');
      }
    }
  }
});

export const Ruta = model<RutaDocumentInterface>('Ruta', RutaSchema);
```

En este código creamos la interfaz de ruta con los campos necesarios. En el modelo de ruta creamos el esquema de ruta con los campos necesarios y las validaciones necesarias. En este caso hemos usado el validate para comprobar que los campos de los arrays de ids de los usuarios existen en la base de datos.

#### Reto

La implementación de la interfaz y el modelo de reto es la siguiente:

```ts
export interface RetoDocumentInterface extends Document {
  id : number;
  nombre : string;
  rutas : RutaDocumentInterface[];
  tipo : 'corriendo' | 'bicicleta' | 'corriendo y bicicleta';
  kilometros :number;
  usuarios : UsuarioDocumentInterface[];
}

const RetoSchema = new Schema<RetoDocumentInterface>({
  id:{
    type: Number,
    required: true,
    unique: true
  },
  nombre:{
    type: String,
    required: true,
    unique: true
  },
  rutas:{
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Rutas',
    validate : async (value : SchemaType[]) => {
      for(const ruta of value){
        const rutacheck = await Ruta.findById(ruta);
        if(!rutacheck){
          throw new Error('La ruta no existe');
        }
      }
    }
  },
  tipo:{
    type: String,
    required: true,
  },
  kilometros:{
    type: Number,
    required: true,
  },
  usuarios:{
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Usuarios',
    validate : async (value : SchemaType[]) => {
      for(const usuario of value){
        const usuariocheck = await Usuario.findById(usuario);
        if(!usuariocheck){
          throw new Error('El usuario no existe');
        }
      }
    }
  }
});

export const Reto = model<RetoDocumentInterface>('Reto', RetoSchema);
```

En este código creamos la interfaz de reto con los campos necesarios. En el modelo de reto creamos el esquema de reto con los campos necesarios y las validaciones necesarias. En este caso hemos usado el validate para comprobar que los campos de los arrays de ids de los usuarios y rutas existen en la base de datos.

#### Grupo

La implementación de la interfaz y el modelo de grupo es la siguiente:

```ts
interface GrupoDocumentInterface extends Document {
  id : number;
  nombre : string;
  participantes : UsuarioDocumentInterface[];
  estadisticas : number[][];
  clasificacion : UsuarioDocumentInterface[][];
  rutas_favoritas : RutaDocumentInterface[];
  historico_rutas : number[][][];
}

const GrupoSchema = new Schema<GrupoDocumentInterface>({
  id : {
    type : Number,
    required : true,
    unique : true
  },
  nombre : {
    type : String,
    required : true,
    unique : true
  },
  participantes : {
    type : [Schema.Types.ObjectId],
    required : true,
    ref : 'Usuarios',
    validate : async (value : SchemaType[]) => {
      for(const usuario of value){
        const usuariocheck = await Usuario.findById(usuario);
        if(!usuariocheck){
          throw new Error('El usuario no existe');
        }
      }
    }
  },
  estadisticas : {
    type : [[Number]],
    required : true
  },
  clasificacion : {
    type : [[Schema.Types.ObjectId]],
    required : true,
    ref : 'Usuarios',
    validate : async (value : SchemaType[]) => {
      for(const usuario of value){
        const usuariocheck = await Usuario.findById(usuario);
        if(!usuariocheck){
          throw new Error('El usuario no existe');
        }
      }
    }
  },
  rutas_favoritas : {
    type : [Schema.Types.ObjectId],
    required : true,
    ref : 'Rutas',
    validate : async (value : SchemaType[]) => {
      for(const ruta of value){
        const rutacheck = await Ruta.findById(ruta);
        if(!rutacheck){
          throw new Error('La ruta no existe');
        }
      }
    }
  },
  historico_rutas : {
    type : [[[Number]]],
    required : true,
    validate : (value : number[][][]) => {
      if(value.length > 0){
        if(value[0].length > 0){
          if(value[0].length != 2){
            throw new Error('El historico de rutas debe tener 2 arrays dentro del segundo array');
          }
          if(value[0][0][0] > 31 || value[0][0][0] < 1){
            throw new Error('El dia debe estar entre 1 y 31');
          }
          if(value[0][0][1] > 12 || value[0][0][1] < 1){
            throw new Error('El mes debe estar entre 1 y 12');
          }
          if(value[0][0][2] > 2023 || value[0][0][2] < 2000){
            throw new Error('El año debe estar entre 2000 y 2023');
          }
        }
      }
    }
  },
});

export const Grupo = model<GrupoDocumentInterface>('Grupo', GrupoSchema);
```

### Implementación de los routers

En la implementación de los routers es donde se reconocen las peticiones y se ejecutan las funciones necesarias para devolver la respuesta adecuada. En este caso se han implementado los routers de usuario, ruta, reto y grupo.

#### Usuario

La implementación del router de usuario es la siguiente:

```ts
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
    return res.status(501).send({
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
```

En este código se puede observar que se han añadido las operaciones de borrado de usuarios, que se encargan de borrar el usuario de todas las listas en las que se encuentre, ya sea de amigos, grupos, rutas, etc. También se ha añadido la operación de borrado de un usuario por su id, que realiza la misma operación que la anterior pero con el id del usuario.
Se realizan las operaciones de insertar, modificar, borrar y obtener usuarios, tanto por su id como por su nombre.

#### Rutas

La implementación de las rutas se ha realizado de la siguiente manera:

```ts
export const rutaRouter = express.Router();


rutaRouter.use(express.json());

rutaRouter.post('/tracks', async(req, res) => {
  try {
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
```

En este código se puede observar que se han añadido las operaciones de borrado de rutas, que se encargan de borrar la ruta de todas las listas en las que se encuentre, ya sea de amigos, grupos, retos, etc. También se ha añadido la operación de borrado de una ruta por su id, que realiza la misma operación que la anterior pero con el id de la ruta.
También tiene las operaciones de insertar, modificar, borrar y obtener rutas, tanto por su id como por su nombre.

#### Retos

La implementación de los retos se ha realizado de la siguiente manera:

```ts
export const retoRouter = express.Router();

retoRouter.use(express.json());

retoRouter.post('/challenges', async(req, res) => {
  const reto = new Reto(req.body);
  try {
    await reto.save();
    return res.status(201).send(reto);
  }catch (error) {
    return res.status(500).send(error);
  }


});

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
```

En este código se puede observar que se han añadido las operaciones de borrado de retos, que se encargan de borrar el reto de todas las listas en las que se encuentre, ya sea de amigos, grupos, retos, etc. También se ha añadido la operación de borrado de un reto por su id, que realiza la misma operación que la anterior pero con el id del reto.
También tiene las operaciones de insertar, modificar, borrar y obtener retos, tanto por su id como por su nombre.

#### Grupos

La implementación de los grupos se ha realizado de la siguiente manera:

```ts
export const grupoRouter = express.Router();

grupoRouter.use(express.json());

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
```

En este código se puede observar que se han añadido las operaciones de borrado de grupos, que se encargan de borrar el grupo de todas las listas en las que se encuentre, ya sea de amigos, grupos, retos, etc. También se ha añadido la operación de borrado de un grupo por su id, que realiza la misma operación que la anterior pero con el id del grupo.
También tiene las operaciones de insertar, modificar, borrar y obtener grupos, tanto por su id como por su nombre.

### Implementación de la app

La implementación de la app es la siguiente:

```ts
export const app = express();
app.use(express.json());
app.use(rutaRouter);
app.use(usuarioRouter);
app.use(grupoRouter);
app.use(retoRouter);
app.use(defaultRouter);
```

En este código simplemente se seleccionan se le dice a la aplicación los routers a usar.A

### Implementación del index

La implementación del index es la siguiente:

```ts
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
```

En este código se le dice al servidor que se ejecute en el puerto que se le ha indicado en el fichero .env.

### Implementación del fichero de mongoose

La implementación es la siguiente:

```ts
try {
  await connect(process.env.MONGODB_URL!);
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log(error);
}
```

En este código se le dice a la aplicación que se conecte a la base de datos de MongoDB.

## Conclusiones

En esta práctica hemos aprendido a realizar un servidor haciendo uso de express y de mongoose, y a realizar las operaciones CRUD sobre una base de datos de MongoDB. También hemos aprendido a realizar un servidor que se conecte a una base de datos de MongoDB.
Esto es muy importante de cara al futuro ya que como programadores es muy interesante aprender a realizar un servidor y conectarlo con la base de datos.

## Bibliografía

- [Express](https://expressjs.com/es/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/es/)
- [TypeScript](https://www.typescriptlang.org/)
