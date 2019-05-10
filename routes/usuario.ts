import { Router, Request, Response } from "express";
import { Usuario } from '../models/usuario_model';
import bcrypt from 'bcrypt';
import Token from "../classes/token";
import { verificaToken } from "../middlewares/autenticacion";

const userRoutes = Router();

//Login
userRoutes.post('/login',(req:Request,res:Response)=>{
    
    const body = req.body;

    Usuario.findOne({email: body.email},(err,userDB)=>{

        if(err) throw err;

        if(!userDB){
            return res.json({
                ok:false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }

        if(userDB.compararPassword(body.password)){

            const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });

            return res.json({
                ok: true,
                token: tokenUser
            });
        }else{
            return res.json({
                ok:false,
                mensaje: 'Usuario/contraseña no son correctos**'
            });
        }
    });
});

// Get config usuario
userRoutes.get('/config',[verificaToken],(req:any,res:Response)=>{
    const usuario = req.usuario;

    Usuario.findOne({email: usuario.email},(err,userDB)=>{

        if(!userDB){
            return res.json({
                ok:false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }

        return res.json({
            ok:true,
            config: userDB.config
        });

    });

    console.log(usuario);

    
});

// Crear un usuario
userRoutes.post('/create', (req:Request,res:Response) =>{

    const body = req.body;

    console.log(body);

    const user = {
        nombre: body.nombre,
        email: body.email,
        nickname: body.nickname,
        config:{
            pais: body.config.pais,
            idioma: body.config.idioma
        },
        password: bcrypt.hashSync(body.password,10),
        avatar: body.avatar,
    }

    Usuario.create(user).then(userDB=>{
        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            nickname: userDB.nickname,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser
        });

    }).catch(err =>{
        if(err){
            const errmsg:string = err['errmsg'];
            if(errmsg.includes('duplicate key')){
                if(errmsg.includes('email')){
                    return res.json({
                        ok:false,
                        mensaje: 'Ya existe un usuario con ese correo'
                    });
                } else if(errmsg.includes('nickname')) {
                    return res.json({
                        ok:false,
                        mensaje: 'Ya existe un usuario con nickname'
                    });
                }
            }else{
                res.json({
                    ok: false,
                    err
                });
            }
        }
    })
});

userRoutes.post('/update', verificaToken, (req:any,res:Response) =>{
    
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.usuario.email,
        avatar: req.body.avatar || req.usuario.avatar,
        nickname: req.body.nickname || req.usuario.nickname
    }

    console.log(req.usuario);

    Usuario.findByIdAndUpdate(req.usuario._id,user,{new:true},(err, userDB)=>{

        if(err){
            const codigo:string = err['codeName'];
            const errmsg:string = err['errmsg'];
            if(codigo.includes("DuplicateKey")){
                if(errmsg.includes('email')){
                    return res.json({
                        ok:false,
                        mensaje: 'Ya existe un usuario con ese correo'
                    });
                } else if(errmsg.includes('nickname')){
                    return res.json({
                        ok:false,
                        mensaje: 'Ya existe un usuario con nickname'
                    });
                }
            }else{
                throw err;
            }
        }

        if(!userDB){
            return res.json({
                ok:false,
                mensaje: 'No existe un usuario con ese ID'
            })
        }

        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser
        });

    });
});

userRoutes.get('/',[verificaToken],(req:any,res:Response)=>{
    const usuario = req.usuario;

    res.json({
        ok: true,
        usuario
    });
});

userRoutes.get('/prueba', (req:Request,res:Response) =>{
    res.json({
        ok:true,
        mensaje: 'Todo funciona bien!'
    })
});

export default userRoutes;