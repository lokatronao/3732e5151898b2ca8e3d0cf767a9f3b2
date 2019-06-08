import {Request,Response,NextFunction} from 'express';
import { Usuario } from "../models/usuario_model";
import Token from '../classes/token';

//* ============================
//* Verificación de token
//* ============================
export const verificaToken = (req:any,res:Response,next:NextFunction) =>{

    const userToken = req.get('x-token') || '';

    Token.comprobarToken(userToken)
    .then((decoded:any)=>{
        Usuario.findOne({_id: decoded.usuario._id},(err:any,userDB:any)=>{

            if(err) throw err;

            if(!userDB){
                return res.json({
                    ok:false,
                    mensaje: 'El usuario al que pertenece este token ya no existe'
                });
            }

            req.usuario = userDB;
            next();
        });
    })
    .catch(err=>{
        res.status(401).json({
            ok: false,
            mensaje: 'Token no valido'
        });
    });

};

//* ================================
//* Middleware para rutas deprecadas
//* ================================
export const deprecated = (req:any,res:Response,next:NextFunction) =>{
    res.status(410).json({
        ok: false,
        mensaje: 'Esta ruta está deprecada'
    });
}