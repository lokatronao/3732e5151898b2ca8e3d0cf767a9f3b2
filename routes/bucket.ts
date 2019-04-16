import { Router, Response } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Bucket } from '../models/bucket_model';
import { Image } from '../models/image_model';
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";

const bucketRoutes = Router();
const fileSystem = new FileSystem();

//Crear Bucket
bucketRoutes.post('/',[verificaToken],(req:any, res:Response)=>{

    const body = req.body;

    Bucket.create(body).then(bucketDB=>{
        console.log("hola");
        res.json({
            ok: true,
            bucket: bucketDB
        })
    }).catch(err =>{
        res.json({
            ok: false,
            err
        })
    })
});

//Añadir imagenes al Bucket
bucketRoutes.post('/image/add',[verificaToken],(req:any, res:Response)=>{

    console.log(req.body.bucket);

    if(!req.body.bucket){
        return res.status(400).json({
            ok: false,
            mensaje: 'Faltan argumentos "bucket"'
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningun archivo'
        });
    }

    const file: FileUpload = req.files.img;

    if(!file){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningun archivo - image'
        });
    }

    if(!file.mimetype.includes('image')){
        return res.status(400).json({
            ok: false,
            mensaje: 'El archivo subido no es una imagen'
        });
    }

    var body = req.body;

    Bucket.findOne({_id: req.body.bucket},async (err,bucketDB)=>{
        
        if(err) throw err;

        if(!bucketDB){
            return res.json({
                ok:false,
                mensaje: 'Bucket no encontrado'
            });
        }

        body = await fileSystem.guardarImagenBucket(file,req.body.bucket,body)
        .catch((err:any)=>{
            return res.json({
                ok: false,
                err
            })
        });

        await Image.create(body).then(imageDB=>{
            bucketDB.imgs.push(imageDB.id);
        });

        //const bodyBucket = bucketDB;

        bucketDB.updateOne(bucketDB, (err,bucketDB)=>{
            if(err) throw err;
            
            if(bucketDB){
                return res.json({
                    ok:true,
                    bucketDB
                });
            }
        })
    });

});

bucketRoutes.get('/image/:bucketid/:img',(req:any,res:Response)=>{

    const bucketId = req.params.bucketid;
    const img = req.params.img;

    const pathFoto = fileSystem.getFotoUrlBucket(bucketId,img);

    res.sendFile(pathFoto);
});


export default bucketRoutes;