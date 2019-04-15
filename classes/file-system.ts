import { FileUpload } from "../interfaces/file-upload";
import path from 'path';
import fs from 'fs';
import uniqueid from 'uniqid';


export default class FileSystem {
    constructor() { };

    guardarImagenTemporal(file: FileUpload, userId: string) {



        return new Promise((resolve, reject) => {
            this.analisis(file)
                .then(() => {
                    //Creación de carpetas
                    const path = this.crearCarpetaUsuario(userId);

                    //Cambiar nombre de archivo a nombre unico
                    const nombreArchivo = this.generarNombreUnico(file.name);

                    //Mover archivo de carpeta temporal a normal
                    file.mv(`${path}/${nombreArchivo}`, (err: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                })
                .catch((err)=>{
                    reject(err);
                });

        })
    }

    private analisis(file: FileUpload) {
        return new Promise(async(resolve, reject) => {
            const vision = require('@google-cloud/vision');

            const client = new vision.ImageAnnotatorClient();

            const [result] = await client.safeSearchDetection(file.tempFilePath);
            const detections = result.safeSearchAnnotation;
            if (detections.adult === null || detections.adult === "VERY_LIKELY") {
                reject("No se pueden subir imagenes sexuales a la plataforma")
            } else {
                resolve()
            }
            /*
            console.log('Safe search:');
            console.log(`Adult: ${detections.adult}`);
            console.log(`Medical: ${detections.medical}`);
            console.log(`Spoof: ${detections.spoof}`);
            console.log(`Violence: ${detections.violence}`);
            console.log(`Racy: ${detections.racy}`);
            */
        })
    }

    private generarNombreUnico(nombreOriginal: string) {

        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1];

        const idUnico = uniqueid();

        return `${idUnico}.${extension}`;

    }

    private crearCarpetaUsuario(userId: string) {

        const pathUser = path.resolve(__dirname, '../uploads', userId);
        const pathUserTemp = pathUser + '/temp';
        console.log(pathUser);

        const existe = fs.existsSync(pathUser);

        if (!existe) {
            fs.mkdirSync(pathUser);
            fs.mkdirSync(pathUserTemp);
        }

        return pathUserTemp;

    }

    imagenesDeTempHaciaPost(userId: string) {
        const pathTemp = path.resolve(__dirname, '../uploads', userId, 'temp');
        const pathPost = path.resolve(__dirname, '../uploads', userId, 'posts');

        if (!fs.existsSync(pathTemp)) {
            return [];
        }

        if (!fs.existsSync(pathPost)) {
            fs.mkdirSync(pathPost);
        }

        const imagenesTemp = this.obtenerImagenesEnTemp(userId);

        imagenesTemp.forEach((imagen: any) => {
            fs.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
        });
        console.log(imagenesTemp);
        return imagenesTemp;
    }

    private obtenerImagenesEnTemp(userId: string) {
        const pathTemp = path.resolve(__dirname, '../uploads', userId, 'temp');

        return fs.readdirSync(pathTemp) || [];
    }

    getFotoUrl(userId: string, img: string) {

        // Path POSTs
        const pathFoto = path.resolve(__dirname, '../uploads', userId, 'posts', img);
        // Si la imagen exist
        const existe = fs.existsSync(pathFoto);
        if (!existe) {
            return path.resolve(__dirname, '../assets/400x250.jpg');
        }

        return pathFoto;

    }
}