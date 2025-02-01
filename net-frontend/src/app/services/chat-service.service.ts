import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Message } from '../model/message';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private socket!:any;
  private messagesSubject = new BehaviorSubject<Message[]>([]);

  public messages$ = this.messagesSubject.asObservable();

  constructor() { 
    this.socket=SocketService.getSocket();
  }

  public initSocket(){
    this.socket.on(
      'message',
      async (data:Message) => {
        console.log(data)
        let message=new Message(data.reciver, data.sender, data.time, data.messageData)
        this.messagesSubject.next([...this.messagesSubject.value, message]);
      }
    );
    this.socket.on('user-disconnected', () => {
      this.messagesSubject.next([])
    });

  }
  public sendMessage(message:Message){
    this.messagesSubject.next([...this.messagesSubject.value, message]);
    this.socket.emit("message",message)
  }
}
