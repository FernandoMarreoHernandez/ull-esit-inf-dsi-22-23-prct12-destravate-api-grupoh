import { Document, Schema, model } from 'mongoose';

interface RetoDocumentInterface extends Document {
  id : number;
  nombre : string;
  rutas : number[];
  tipo : 'corriendo' | 'bicicleta' | 'corriendo y bicicleta';
  kilometros :number;
  usuarios : number[];
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
    type: [Number],
    required: true,
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
    type: [Number],
    required: true,
  }
});

export const Reto = model<RetoDocumentInterface>('Reto', RetoSchema);
