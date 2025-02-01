import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { WebrtcService } from '../../services/webrtc.service';

@Component({
  selector: 'app-video-chat',
  standalone: false,
  
  templateUrl: './video-chat.component.html',
  styleUrl: './video-chat.component.css'
})
export class VideoChatComponent implements AfterViewInit{
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  constructor(private webrtcService: WebrtcService) {}

  ngAfterViewInit() {
    // Automatically start call when component loads
    this.webrtcService.startCall(this.localVideo.nativeElement, this.remoteVideo.nativeElement);
  }


}
