import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, orderBy, collectionData, setDoc, doc, or } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Message {
  content: string;
  timestamp: Date;
  from: string; // UID de l'expéditeur
  to: string;   // UID du destinataire
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private firestore: Firestore) {}

// Récupérer les messages où l'utilisateur est impliqué soit en tant que 'from' soit en tant que 'to'
getMessages(userUid: string): Observable<Message[]> {
  const messagesRef = collection(this.firestore, 'messages');

  // Requête pour récupérer les messages où l'utilisateur est impliqué
  const q = query(
    messagesRef,
    or(
      where('from', '==', userUid),
      where('to', '==', userUid)
    )
  );

  return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
}

  // Envoyer un message
  async sendMessage(content: string, from: string, to: string): Promise<void> {
    const message: Message = {
      content,
      timestamp: new Date(),
      from,
      to
    };

    const messagesRef = collection(this.firestore, 'messages');
    await setDoc(doc(messagesRef), message);
  }
}
