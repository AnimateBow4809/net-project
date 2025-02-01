import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private static socket: Socket=io('http://localhost:3000');;

  private constructor() {
  }

  public static getSocket(): Socket {
    return this.socket;
  }

}
