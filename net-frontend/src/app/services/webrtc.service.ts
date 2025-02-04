import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { SocketService } from './socket.service';
import { ChatServiceService } from './chat-service.service';
import { Message } from '../model/message';

@Injectable({
  providedIn: 'root',
})
export class WebrtcService {
  private socket;
  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;
  private remoteStream!: MediaStream;
  private peerId!: string;

  private remoteVideo!: HTMLVideoElement;

  constructor() {
    this.socket = SocketService.getSocket();
    this.setupSocketListeners();
  }

  async startCall(localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement) {
    this.remoteVideo = remoteVideo;
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = this.localStream;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        remoteVideo.srcObject = this.remoteStream;
      }
      this.remoteStream.addTrack(event.track);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          peerId: this.peerId,
          candidate: event.candidate,
        });
      }
    };

    if (this.peerId) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', { peerId: this.peerId, sdp: offer });
    }
  }
  private async connectToNewUser(peerId: string) {
    this.peerId = peerId;
    sessionStorage.setItem("peer_id", this.peerId);

    console.log(`Connecting to new user: ${peerId}`);

    // Close the previous connection and create a new one
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.close();
    }

    this.remoteVideo.srcObject = null; // Clear previous remote video
    this.remoteStream = new MediaStream(); // Create a new MediaStream for the new user
    this.remoteVideo.srcObject = this.remoteStream;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks to the new connection
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle receiving new tracks
    this.peerConnection.ontrack = (event) => {
      console.log("New track received");
      this.remoteStream.addTrack(event.track);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          peerId: this.peerId,
          candidate: event.candidate,
        });
      }
    };

    console.log(`New WebRTC connection established with ${this.peerId}`);

    // Delay to ensure WebRTC setup is completed before sending an offer
    setTimeout(async () => {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit("offer", { peerId: this.peerId, sdp: offer });
    }, 500);
  }



  private setupSocketListeners() {
    this.socket.on('matched', (data) => {
      console.log('Matched with:', data.peerId);
      this.peerId = data.peerId;
      sessionStorage.setItem('peer_id', this.peerId);
    });


    this.socket.on("offer", async (data) => {
      if (!this.peerConnection) {
        this.peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });

        this.peerConnection.ontrack = (event) => {
          if (!this.remoteStream) {
            this.remoteStream = new MediaStream();
            this.remoteVideo.srcObject = this.remoteStream;
          }
          this.remoteStream.addTrack(event.track);
        };

        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.socket.emit("ice-candidate", {
              peerId: data.sender,
              candidate: event.candidate,
            });
          }
        };
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", { peerId: data.sender, sdp: answer });
    });

    this.socket.on("answer", async (data) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });


    this.socket.on('answer', async (data) => {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );
    });

    this.socket.on("ice-candidate", (data) => {
      if (this.peerConnection) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    this.socket.on("user-disconnected", () => {
      console.log("Partner disconnected. Searching for a new user...");

      this.remoteVideo.srcObject = null; // Clear old video
      sessionStorage.removeItem("peer_id");

      this.socket.once("matched", (data) => {
        console.log("New partner found:", data.peerId);
        this.connectToNewUser(data.peerId);
      });
    });


    this.socket.on('user-disconnected', () => {
      this.remoteVideo.srcObject = null;
      sessionStorage.removeItem('peer_id');
    });
  }
}
