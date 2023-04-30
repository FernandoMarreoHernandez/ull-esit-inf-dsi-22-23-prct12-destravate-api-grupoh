import { connect } from 'mongoose';

connect('mongodb://127.0.0.1:27017/rutas-api').then(() => {
  console.log('Coneccion a la base de datos exitosa');
}).catch(() => {
  console.log('No se pudo conectar a la base de datos');
});
