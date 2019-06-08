import { Router, Response } from "express";
import { verificaToken, deprecated } from '../middlewares/autenticacion';
import { Post} from '../models/post_model';
import { detectarIdioma } from '../routes/traduccion'
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";

const postRoutes = Router();
const fileSystem = new FileSystem();

//* ============================
//* Obtener post paginados
//* ============================
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


//* ============================
//* Crear post
//* ============================
postRoutes.post('/',[verificaToken],async (req:any, res:Response)=>{

    var body = req.body;

    const mensaje = {
        texto:  body.mensaje,
        idioma: "",
    }

    await  detectarIdioma(body.mensaje)
    .then((resp:any)=>{
        mensaje.idioma = resp.language;
    }).catch((err)=>{
        return res.json({
            ok: false,
            err
        })
    })

    
    body.usuario = req.usuario._id;
    body.mensaje = mensaje



    console.log(body);

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

//* ============================
//* Subir imagenes
//* ============================
//!  Este metodo o funcion está deprecado
postRoutes.post('/upload',[deprecated, verificaToken ], async (req:any,res:Response)=>{

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

//* ============================
//* Obtener imagenes
//* ============================
//!  Este metodo o funcion está deprecado
postRoutes.get('/imagen/:userid/:img',[deprecated],(req:any,res:Response)=>{

    const userId = req.params.userid;
    const img = req.params.img;

    const pathFoto = fileSystem.getFotoUrl(userId,img);

    res.sendFile(pathFoto);
});

export default postRoutes;