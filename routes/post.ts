import { Router, Response } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post_model";
import { FileUpload } from "../interfaces/file-upload";

const postRoutes = Router();

//Obtener Post Paginados
postRoutes.get('/', async (req:any, res:Response)=>{

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina -1;
    skip = skip * 10;

    const posts = await Post.find()
    .sort({_id: -1})
    .skip(skip)
    .limit(10)
    .populate('usuario','-password')
    .exec();

    res.json({
        ok: true,
        pagina,
        posts
    });

});


//Crear Post
postRoutes.post('/',[verificaToken],(req:any, res:Response)=>{

    const body = req.body;

    body.usuario = req.usuario._id;

    Post.create(body).then( async postDB=>{

        await postDB.populate('usuario','-password').execPopulate();

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

postRoutes.post('/upload',[ verificaToken ],(req:any,res:Response)=>{

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

    res.json({
        ok: false,
        file: file.mimetype
    })
})

export default postRoutes;