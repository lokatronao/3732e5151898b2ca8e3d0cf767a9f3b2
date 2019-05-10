import { Router, Request, Response } from "express";
import { Usuario } from '../models/usuario_model';
import bcrypt from 'bcrypt';
import Token from "../classes/token";
import { verificaToken } from "../middlewares/autenticacion";

const translateRoutes = Router();

translateRoutes.post('/', verificaToken, (req:any,res:Response) =>{

    const body = req.body;

    if(!body.text){
        res.json({
            ok: false,
            mensaje: "Tiene que haber un texto para detectar el idioma"
        });
    }

    const {Translate} = require('@google-cloud/translate');

    const projectId = 'picturegram-3a1fe'

    const translate = new Translate({projectId});

    translate.detect(body.text,(err:any,results:any)=>{
        if(err){
            res.json({
                ok: false,
                err
            });
        }else{
            res.json({
                ok: true,
                results
            });
        }
    });

});

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

        res.json({
            ok: true,
            translation
        });
    }).catch((err:any) => {
        res.json({
            ok: false,
            err
        });
    });

});


export default translateRoutes;