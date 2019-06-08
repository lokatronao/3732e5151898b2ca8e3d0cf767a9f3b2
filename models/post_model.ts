
import { Schema, Document, model} from 'mongoose';

const postSchema = new Schema({

    created:{
        type: Date
    },
    mensaje: {
        texto: {
            type: String,
            required: [true, 'Debe existir el texto del mensaje']
        },
        idioma: {
            type: String
        }   
    },
    bucket:{
        type: Schema.Types.ObjectId,
        ref: 'Bucket',
        required: [ true, 'Debe existir una referencia a un bucket' ]
    },
    coords:{
        type: String
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [ true, 'Debe existir una referencia a un usuario' ]
    }
});

postSchema.pre<IPost>('save', function( next ){
    this.created = new Date();
    next();
});

interface IPost extends Document{
    created: Date;
    mensaje: {
        texto: String;
        idioma: String;
    }
    imgs: String[];
    coords: String;
    usuario: String;
}

export const Post = model<IPost>('Post',postSchema);