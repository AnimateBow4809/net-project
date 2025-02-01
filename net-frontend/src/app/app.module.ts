import { ChangeDetectorRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoChatComponent } from './components/video-chat/video-chat.component';
import { WebrtcService } from './services/webrtc.service';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { ChatServiceService } from './services/chat-service.service';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    VideoChatComponent,
    ChatboxComponent,
    ChatMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [WebrtcService,ChatServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
