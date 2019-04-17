import { Router, Response } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post_model";
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";
import path from 'path';

const postRoutes = Router();
const fileSystem = new FileSystem();

//Obtener Post Paginados
postRoutes.get('/', async (req:any, res:Response)=>{

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina -1;
    skip = skip * 10;

    const posts = await Post.find()
    .sort({_id: -1})
    .skip(skip)
    .limit(10)
    .populate({path:'bucket',populate:{path:'imgs'}})
    .populate('usuario','-password')
    .exec();

    res.json({
        ok: true,
        pagina,
        posts
    });

});


//Crear Post
postRoutes.post('/',[verificaToken],async (req:any, res:Response)=>{

    const body = req.body;
    body.usuario = req.usuario._id;
    console.log(body);
    //const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
    //body.imgs = imagenes;

    Post.create(body).then( async postDB=>{

        console.log(body.usuario);
        console.log(postDB.usuario);

        await postDB.populate('usuario','-password').execPopulate();
        await postDB.populate('bucket').execPopulate();
        await postDB.populate('bucket.imgs').execPopulate();
        
        res.json({
            ok: true,
            post: postDB
        })
    }).catch(err =>{
        res.json({
            ok: false,
            err
        })
    })
});

// Servicio para subir archivos

postRoutes.post('/upload',[ verificaToken ], async (req:any,res:Response)=>{

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se subió ningun archivo'
        });
    }

    const file: FileUpload = req.files.imagen;

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

    await fileSystem.guardarImagenTemporal(file,req.usuario._id)
    .then(()=>{
        res.json({
            ok: true,
            file: file.mimetype
        })
    })
    .catch((err:any)=>{
        return res.json({
            ok: false,
            err
        })
    });

    
});

postRoutes.get('/imagen/:userid/:img',(req:any,res:Response)=>{

    const userId = req.params.userid;
    const img = req.params.img;

    const pathFoto = fileSystem.getFotoUrl(userId,img);

    res.sendFile(pathFoto);
});

export default postRoutes;