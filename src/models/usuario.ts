import { Document, Schema, SchemaType, model } from 'mongoose';
import validator from 'validator';
import { RetoDocumentInterface } from './reto.js';
import { RutaDocumentInterface } from './ruta.js';
import { Ruta } from './ruta.js';
import { Reto } from './reto.js';


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

/**
 * Esquema de la colección de usuarios
 * @type {Schema<UsuarioDocumentInterface>}
 * @param {number} id - Identificador del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {RutaDocumentInterface[]} rutas_favoritas - Rutas favoritas del usuario
 * @param {RetoDocumentInterface[]} retos_activos - Retos activos del usuario
 * @param {UsuarioDocumentInterface[]} amigos - Amigos del usuario
 * @param {UsuarioDocumentInterface[][]} grupos - Grupos del usuario
 * @param {number[][]} estadisticas - Estadisticas del usuario
 * @param {"bicicleta" | "correr" | "bicicleta y correr"} actividad - Actividad del usuario
 * @param {number[][][]} historico_rutas - Historico de rutas del usuario [[[fecha][rutas]],[[fecha][rutas]]]
 */
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
