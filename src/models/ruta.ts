import { Document, Schema, model } from 'mongoose';

interface RutaDocumentInterface extends Document {
  id : number;
  nombre : string;
  geolocalizacion_inicio : number[];
  geolocalizacion_fin : number[];
  longitud : number;
  desnivel : number;
  usuarios : number[];
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
    type : [Number],
    required: true,
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
