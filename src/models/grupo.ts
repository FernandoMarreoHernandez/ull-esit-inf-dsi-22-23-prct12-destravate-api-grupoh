import { Document, Schema, model, SchemaType } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';
import { RutaDocumentInterface } from './ruta.js';
import { Usuario } from './usuario.js';
import { Ruta } from './ruta.js';

interface GrupoDocumentInterface extends Document {
  id : number;
  nombre : string;
  participantes : UsuarioDocumentInterface[];
  estadisticas : number[][];
  clasificacion : UsuarioDocumentInterface[][];
  rutas_favoritas : RutaDocumentInterface[];
  historico_rutas : number[][][];
}

/**
 * Esquema de la colección de grupos
 * @type {Schema<GrupoDocumentInterface>}
 * @param {number} id - Identificador del grupo
 * @param {string} nombre - Nombre del grupo
 * @param {UsuarioDocumentInterface[]} participantes - Participantes del grupo
 * @param {number[][]} estadisticas - Estadisticas del grupo
 * @param {UsuarioDocumentInterface[][]} clasificacion - Clasificación del grupo
 * @param {RutaDocumentInterface[]} rutas_favoritas - Rutas favoritas del grupo
 * @param {number[][][]} historico_rutas - Historico de rutas del grupo [[[fecha][rutas]],[[fecha][rutas]]]
 */
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
