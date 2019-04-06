
import Server from './classes/server';

const server = new Server();

server.start( () => {
    console.log(`Servidor corriendo en ${server.port}`);
});