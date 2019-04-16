import { Schema, Document, model} from 'mongoose';

const bucketSchema = new Schema({

    created:{
        type: Date
    },
    imgs:[{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }]
});

bucketSchema.pre<IBucket>('save', function( next ){
    this.created = new Date();
    next();
});

export interface IBucket extends Document{
    created: Date;
    imgs: String[];
}

export const Bucket = model<IBucket>('Bucket',bucketSchema);