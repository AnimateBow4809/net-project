import { Component, Input } from '@angular/core';
import {Message} from '../../model/message';

@Component({
  selector: 'app-chat-message',
  standalone: false,

  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.css'
})
export class ChatMessageComponent {
  @Input() message!: Message;

}
