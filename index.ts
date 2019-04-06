
import Server from './classes/server';
import userRoutes from './routes/usuario';

const server = new Server();

server.app.use('/user', userRoutes);

server.start( () => {
    console.log(`Servidor corriendo en ${server.port}`);
});