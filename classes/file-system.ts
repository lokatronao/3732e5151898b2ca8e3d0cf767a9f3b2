import { FileUpload } from "../interfaces/file-upload";
import path from 'path';
import fs from 'fs';
import uniqueid from 'uniqid';


export default class FileSystem {
    constructor() { };

    guardarImagenTemporal(file: FileUpload, userId: string) {

        return new Promise((resolve, reject) => {
            this.analisis(file)
                .then(async() => {
                    //Creación de carpetas
                    const path = this.crearCarpetaUsuario(userId);

                    //Cambiar nombre de archivo a nombre unico
                    const nombreArchivo = this.generarNombreUnico(file.name);
                    //Mover archivo de carpeta temporal a normal
                    const tinify = require("tinify");
                    tinify.key = "32C5et4342VLw7OWo53L8cvNKvprfppk";
                    const source = tinify.fromFile(file.tempFilePath);
                    file.mv(`${path}/${nombreArchivo}`, (err: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            source.toFile(`${path}/${nombreArchivo}`)
                            .then(()=>{
                                throw(err);
                                //console.log("terminada la compresion");
                            })
                            .catch((err:any) => {
                                console.log(err);
                            });
                            resolve();
                        }
                    })
                })
                .catch((err) => {
                    reject(err);
                });

        })
    };

    //Test bucket

    guardarImagenBucket(file: FileUpload, bucketId: string, body: any) {
        return new Promise((resolve, reject) => {
            this.analisisBucket(file)
            .then(async(detections) => {
                //Creación de carpetas
                const path = this.crearCarpetaBucket(bucketId);

                //Cambiar nombre de archivo a nombre unico
                const nombreArchivo = this.generarNombreUnico(file.name);
                body.img = nombreArchivo;
                body.detections = detections;
                //Mover archivo de carpeta temporal a normal
                const tinify = require("tinify");
                tinify.key = "32C5et4342VLw7OWo53L8cvNKvprfppk";
                const source = tinify.fromFile(file.tempFilePath);
                file.mv(`${path}/${nombreArchivo}`, (err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        source.toFile(`${path}/${nombreArchivo}`)
                        .then(()=>{
                            console.log("terminada la compresion");
                        })
                        .catch((err:any) => {
                            console.log(err);
                        });
                        resolve(body);
                    }
                })
            })
            .catch((err) => {
                reject(err);
            });
        });
    };

    private analisisBucket(file: FileUpload) {
        return new Promise(async (resolve, reject) => {
            const vision = require('@google-cloud/vision');

            const client = new vision.ImageAnnotatorClient();

            const [result] = await client.safeSearchDetection(file.tempFilePath)
            .catch((err:any) => {
                console.log("excedido max buffer");
            });;
            const detections = result.safeSearchAnnotation;
            const adult = detections.adult || "";
            if (adult === "VERY_LIKELY") {
                resolve(detections)
            } else {
                resolve(detections)
            }
        })
    };

    private crearCarpetaBucket(bucketId: string) {

        const pathBucket = path.resolve(__dirname, '../uploads',`b-${bucketId}`);
        console.log(pathBucket);

        const existe = fs.existsSync(pathBucket);

        if (!existe) {
            fs.mkdirSync(pathBucket);
        }

        return pathBucket;

    }

    getFotoUrlBucket(bucketId: string, img: string) {

        // Path POSTs
        const pathFoto = path.resolve(__dirname, '../uploads', `b-${bucketId}`, img);
        // Si la imagen exist
        const existe = fs.existsSync(pathFoto);
        if (!existe) {
            return path.resolve(__dirname, '../assets/400x250.jpg');
        }

        return pathFoto;

    }

    // FIN Test Bucket

    private analisis(file: FileUpload) {
        return new Promise(async (resolve, reject) => {
            const vision = require('@google-cloud/vision');

            const client = new vision.ImageAnnotatorClient();

            const [result] = await client.safeSearchDetection(file.tempFilePath);
            const detections = result.safeSearchAnnotation;
            const adult = detections.adult || "";
            if (adult === "VERY_LIKELY") {
                console.log("Imagen inapropiada");
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

        var pathFoto;

        try{
            // Path POSTs
            pathFoto = path.resolve(__dirname, '../uploads', userId, 'posts', img);
            // Si la imagen exist
            const existe = fs.existsSync(pathFoto);
            if (!existe) {
                return path.resolve(__dirname, '../assets/400x250.jpg');
            }
        }catch(err){
            console.log(err);
            return path.resolve(__dirname, '../assets/400x250.jpg');
        }

        return pathFoto;

    }
}