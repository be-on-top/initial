import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, orderBy, collectionData, setDoc, doc, or, deleteDoc } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

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
// Méthode impeccable !!!!!!!!!
// getMessages(userUid: string): Observable<Message[]> {
//   const messagesRef = collection(this.firestore, 'messages');

//   // Requête pour récupérer les messages où l'utilisateur est impliqué
//   const q = query(
//     messagesRef,
//     or(
//       where('from', '==', userUid),
//       where('to', '==', userUid)
//     )
//   );

//   return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
// }

// Si on supprime les messages de plus de 10 jours au moment de la récupération 
getMessages(userUid: string): Observable<Message[]> {
  const messagesRef = collection(this.firestore, 'messages');
  const q = query(
    messagesRef,
    or(
      where('from', '==', userUid),
      where('to', '==', userUid)
    )
  );

  return collectionData(q, { idField: 'id' }).pipe(
    map(messages => {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 jours en arrière
      return messages.filter(message => {
        if (message['timestamp'].toDate() <= tenDaysAgo) {
          this.deleteMessage(message['id']);  // Supprimez les messages expirés
          return false;
        }
        return true;
      });
    })
  ) as Observable<Message[]>;
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

  // async deleteMessage(id: string | undefined): Promise<void> {
  //   const messagesRef = collection(this.firestore, 'messages');
  //   const messageDoc = doc(messagesRef, id);
  //   await deleteDoc(messageDoc);
  // }

  deleteMessage(messageId: string | undefined): Promise<void> {
    const messageDocRef = doc(this.firestore, `messages/${messageId}`);
    console.log(messageDocRef);
    
    return deleteDoc(messageDocRef);
  }
  

}
