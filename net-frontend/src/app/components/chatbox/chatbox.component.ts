import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../../services/chat-service.service';
import { Message } from '../../model/message';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chatbox',
  standalone: false,

  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css'
})
export class ChatboxComponent implements AfterViewInit{
  public newMessage!:String;
  public messages!:Message[];
  public currentPeerId: string|null =sessionStorage.getItem("peer_id");

  constructor(private  chatService:ChatServiceService,private cdr: ChangeDetectorRef) {
  }
  ngAfterViewInit(): void {
    this.chatService.initSocket();
    this.chatService.messages$.subscribe((messages: Message[]) => {
      this.messages = messages;
      this.currentPeerId=sessionStorage.getItem("peer_id");
      console.log(this.messages)
      this.cdr.detectChanges();

    });

  }

  sendMessage(){
    if(sessionStorage.getItem("peer_id")){
      this.chatService.sendMessage(new Message(String(sessionStorage.getItem("peer_id")),String(SocketService.getSocket().id),new Date(),this.newMessage))
      this.newMessage="";
    }
  }
}
