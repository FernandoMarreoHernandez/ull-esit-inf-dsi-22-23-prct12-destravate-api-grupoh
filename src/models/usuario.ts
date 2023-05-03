import { Document, Schema, SchemaType, model } from 'mongoose';
import validator from 'validator';



export interface UsuarioDocumentInterface extends Document {
  id : number;
  nombre : string;
  rutas_favoritas : number[];
  retos_activos : number[];
  // quiero que se almacene los ids de los usuarios, en usario document interface pero con los ids
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
    type : [Number],
    required: true
  },
  retos_activos : {
    type : [Number],
    required: true
  },
  amigos : {
    type : [Schema.Types.ObjectId],
    required: true,
    ref : 'Usuarios'
  },
  grupos : {
    type : [[Schema.Types.ObjectId]],
    required: true
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
      //en el segundo array solo puede tener 2 arrays dentro, el primero es con una fecha, y el segundo es con numeros
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
