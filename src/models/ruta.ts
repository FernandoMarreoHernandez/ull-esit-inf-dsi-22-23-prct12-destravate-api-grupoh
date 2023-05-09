import { Document, Schema, model, SchemaType } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';
import { Usuario } from './usuario.js';

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

/**
 * Esquema de la colección de rutas
 * @type {Schema<RutaDocumentInterface>}
 * @param {number} id - Identificador de la ruta
 * @param {string} nombre - Nombre de la ruta
 * @param {number[]} geolocalizacion_inicio - Geolocalización de inicio de la ruta
 * @param {number[]} geolocalizacion_fin - Geolocalización de fin de la ruta
 * @param {number} longitud - Longitud de la ruta
 * @param {number} desnivel - Desnivel de la ruta
 * @param {UsuarioDocumentInterface[]} usuarios - Usuarios que han realizado la ruta
 * @param {"bicicleta" | "corriendo" | "bicicleta y corriendo"} tipo - Tipo de la ruta
 * @param {number} calificacion - Calificación de la ruta
 */
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
