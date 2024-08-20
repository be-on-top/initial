import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { Timestamp } from '@angular/fire/firestore';

interface Message {
  content: string;
  timestamp: any; // Utilisez `any` pour permettre `Timestamp` ou `Date`
  from: string;
  to: string;
  id?: string;   // ID du document Firestore, optionnel
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: Observable<Message[]> = new Observable<Message[]>();
  newMessage: string = '';
  userUid: string = '';
  adminUid: string = 'mBUxCKgzUhXSBg5hg8Bxr2NYAo72';
  userName:string = ''

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userUid = params.get('id') || '';
      this.userName = params.get('name') || '';
      if (this.userUid) {
        this.messages = this.chatService.getMessages(this.userUid).pipe(
          map(messages => messages.map(message => ({
            ...message,
            timestamp: this.convertTimestamp(message.timestamp)
          }))),
          map(messages => messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))
        );
      }
    });
  }

  // Méthode pour convertir un Timestamp en Date
  private convertTimestamp(timestamp: any): Date {
    return timestamp instanceof Timestamp
      ? new Date(timestamp.seconds * 1000)
      : timestamp; // Si c'est déjà un Date, on retourne tel quel
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, this.userUid, this.adminUid);
      this.newMessage = '';
    }
  }

  cleanUpMessages() {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 jours en arrière
    
    // On s'abonne aux messages pour les parcourir
    this.messages.subscribe(messages => {
      messages.forEach(message => {
        if (this.convertTimestamp(message.timestamp) <= tenDaysAgo) {
          console.log('id message à virer', message.id);
          
          // this.chatService.deleteMessage(message.id);
        }
      });
    });
  }
  
}
