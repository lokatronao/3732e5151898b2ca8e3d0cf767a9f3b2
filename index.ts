
import Server from './classes/server';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import postRoutes from './routes/post';
import userRoutes from './routes/usuario';
import bucketRoutes from './routes/bucket';
import cors from 'cors';

const server = new Server();

// Body parser
server.app.use(bodyParser.urlencoded({ extended:true}));
server.app.use(bodyParser.json());

// FileUpload
server.app.use(fileUpload({useTempFiles:true}));

//Configurar CORS
server.app.use(cors({
    origin:true,
    credentials:true
}))

// Rutas de la api
server.app.use('/user', userRoutes);
server.app.use('/posts', postRoutes);
server.app.use('/bucket', bucketRoutes);


// Conectar BD

mongoose.connect('mongodb://api:apiConnect8@ds123753.mlab.com:23753/curso',{
    useNewUrlParser: true, useCreateIndex: true
}, (err) =>{
    if(err) throw err;

    console.log("Base de datos ONLINE");
});

// Levantar express
server.start( () => {
    console.log(`Servidor corriendo en ${server.port}`);
});