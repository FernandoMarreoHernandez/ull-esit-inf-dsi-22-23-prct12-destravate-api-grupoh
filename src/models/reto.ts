import { Document, Schema, model, SchemaType } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';
import { RutaDocumentInterface } from './ruta.js';
import { Ruta } from './ruta.js';
import { Usuario } from './usuario.js';

export interface RetoDocumentInterface extends Document {
  id : number;
  nombre : string;
  rutas : RutaDocumentInterface[];
  tipo : 'corriendo' | 'bicicleta' | 'corriendo y bicicleta';
  kilometros :number;
  usuarios : UsuarioDocumentInterface[];
}

/**
 * Esquema de la colección de retos
 * @type {Schema<RetoDocumentInterface>}
 * @param {number} id - Identificador del reto
 * @param {string} nombre - Nombre del reto
 * @param {RutaDocumentInterface[]} rutas - Rutas del reto
 * @param {'corriendo' | 'bicicleta' | 'corriendo y bicicleta'} tipo - Tipo de reto
 * @param {number} kilometros - Kilometros del reto
 * @param {UsuarioDocumentInterface[]} usuarios - Usuarios del reto
 */
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
