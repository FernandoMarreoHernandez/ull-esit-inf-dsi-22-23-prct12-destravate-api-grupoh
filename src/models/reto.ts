import { Document, Schema, model } from 'mongoose';
import { UsuarioDocumentInterface } from './usuario.js';
import { RutaDocumentInterface } from './ruta.js';

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
    ref: 'Rutas'
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
    ref: 'Usuarios'
  }
});

export const Reto = model<RetoDocumentInterface>('Reto', RetoSchema);
