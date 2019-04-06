
import Server from './classes/server';
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';

const server = new Server();

server.app.use('/user', userRoutes);


//Conectar BD

mongoose.connect('mongodb://api:apiConnect8@ds123753.mlab.com:23753/curso',{
    useNewUrlParser: true, useCreateIndex: true
}, (err) =>{
    if(err) throw err;

    console.log("Base de datos ONLINE")
});

//Levantar express
server.start( () => {
    console.log(`Servidor corriendo en ${server.port}`);
});