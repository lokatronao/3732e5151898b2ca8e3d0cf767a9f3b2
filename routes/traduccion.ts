import { Router, Request, Response } from "express";
import { Usuario } from '../models/usuario_model';
import bcrypt from 'bcrypt';
import Token from "../classes/token";
import { verificaToken } from "../middlewares/autenticacion";

const translateRoutes = Router();

//* ============================
//* Comprobar idioma de un texto
//* ============================
translateRoutes.post('/', verificaToken, (req:any,res:Response) =>{

    const body = req.body;

    if(!body.text){
        res.json({
            ok: false,
            mensaje: "Tiene que haber un texto para detectar el idioma"
        });
    }

    detectarIdioma(body.text)
    .then((resp)=>{
        res.json({
            ok: true,
            resp
        });
    })
    .catch((err)=>{
        res.json({
            ok: false,
            err
        });
    });
});

//* ============================
//* Traducir un texto
//* ============================
translateRoutes.post('/translate', verificaToken, (req:any,res:Response) =>{

    const body = req.body;

    if(!body.text){
        res.json({
            ok: false,
            mensaje: "Tiene que haber un texto para traducir"
        });
    }

    if(!body.target){
        res.json({
            ok: false,
            mensaje: "Tiene que haber un target para saber el idioma al que traducir"
        });
    }

    const {Translate} = require('@google-cloud/translate');

    const projectId = 'picturegram-3a1fe'

    const translate = new Translate({projectId});

    translate.translate(body.text,body.target)
    .then((result:any) => {
        //const results = JSON.parse(result);

        const translation = result[0];
        console.log(translation);
        res.json({
            ok: true,
            translation
        });
    }).catch((err:any) => {
        console.log(err);
        res.json({
            ok: false,
            err
        });
    });

});

//* ===================================================
//* Funcion encargada de detectar idioma de un texto
//* ===================================================
export function detectarIdioma(text:String){
    const {Translate} = require('@google-cloud/translate');

    const projectId = 'picturegram-3a1fe'

    const translate = new Translate({projectId});

    return new Promise((resolve,reject)=>{
        translate.detect(text,(err:any,results:any)=>{
            if(err){
                reject(err);
            }else{
                resolve(results);
            }
        })
    })
}

export default translateRoutes;