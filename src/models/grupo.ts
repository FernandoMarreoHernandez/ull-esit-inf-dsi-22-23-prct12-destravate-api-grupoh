import { Document, Schema, model } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';
import { RutaDocumentInterface } from './ruta.js';

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
    ref : 'Usuarios'
  },
  estadisticas : {
    type : [[Number]],
    required : true
  },
  clasificacion : {
    type : [[Schema.Types.ObjectId]],
    required : true,
    ref : 'Usuarios'
  },
  rutas_favoritas : {
    type : [Schema.Types.ObjectId],
    required : true,
    ref : 'Rutas'
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
