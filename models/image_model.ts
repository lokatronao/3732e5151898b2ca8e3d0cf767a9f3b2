import { Schema, Document, model} from 'mongoose';

const imageSchema = new Schema({

    created:{
        type: Date
    },
    img:{
        type: String, 
        required: [ true, 'Debe existir una imagen']
    },
    detections:{
        adult:{
            type: String
        },
        spoof:{
            type: String
        },
        medical:{
            type: String
        },
        violence:{
            type: String
        },
        racy:{
            type: String
        }
    }
});

imageSchema.pre<IImage>('save', function( next ){
    this.created = new Date();
    next();
});

interface IImage extends Document{
    created: Date;
    img: String;
    detections:{
        adult: String,
        spoof: String,
        medical: String,
        violence: String,
        racy: String
    }
}

export const Image = model<IImage>('Image',imageSchema);