import { Router, Request, Response } from "express";
import { Usuario } from "../models/usuario_model";
import bcrypt from 'bcrypt';

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
            return res.json({
                ok: true,
                token: 'ALHKSAKJASHFASLKSAFHFASFHLF'
            });
        }else{
            return res.json({
                ok:false,
                mensaje: 'Usuario/contraseña no son correctos**'
            });
        }
    });

});


// Crear un usuario
userRoutes.post('/create', (req:Request,res:Response) =>{

    const body = req.body;

    const user = {
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        avatar: body.avatar,
    }

    Usuario.create(user).then(userDB=>{
        res.json({
            ok:true,
            user: userDB
        });
    }).catch(err =>{
        res.json({
            ok: false,
            err
        })
    })

    
});

userRoutes.get('/prueba', (req:Request,res:Response) =>{
    res.json({
        ok:true,
        mensaje: 'Todo funciona bien!'
    })
});

export default userRoutes;