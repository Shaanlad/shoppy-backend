import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({
    cors: {
        origin: '*',
        // methods: ['GET', 'POST'],
    }
})
export class ProductGateway {

    constructor(private readonly authService: AuthService) {}

    @WebSocketServer()
    private readonly server: Server;

    handleProductUpdated(){
        this.server.emit('productUpdated', 
            // { message: 'A product has been updated' }
        );
    }

    handleConnection(client: Socket) {
        try {
            this.authService.verifyToken(
                client.handshake.auth.Authentication.value);
            console.log('Client connected:', client.id);
        }
        catch (error) {
            console.log('Client connection failed:', client.id);
            client.disconnect(true);
        }
    }
}