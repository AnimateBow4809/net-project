import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoChatComponent } from './components/video-chat/video-chat.component';
import { WebrtcService } from './services/webrtc.service';

@NgModule({
  declarations: [
    AppComponent,
    VideoChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [WebrtcService],
  bootstrap: [AppComponent]
})
export class AppModule { }
