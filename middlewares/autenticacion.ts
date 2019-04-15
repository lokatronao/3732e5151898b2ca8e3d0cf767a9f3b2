import {Request,Response,NextFunction} from 'express';
import Token from '../classes/token';

export const verificaToken = (req:any,res:Response,next:NextFunction) =>{

    const userToken = req.get('x-token') || '';

    Token.comprobarToken(userToken)
    .then((decoded:any)=>{
        req.usuario = decoded.usuario;
        next();
    })
    .catch(err=>{
        res.status(401).json({
            ok: false,
            mensaje: 'Token no valido'
        });
    });

};