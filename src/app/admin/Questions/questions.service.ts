import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, getStorage, uploadBytesResumable, getMetadata, listAll } from '@angular/fire/storage';



@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  image: any;
  mediaQuestions: string[]
  mediaResponses: string[]

  constructor(private storage: Storage) {
    this.mediaQuestions = []
    this.mediaResponses = []
  }


  uploadFiles(file: any, fieldName: string) {

    // Upload file and metadata to the object 'images/mountains.jpg'
    console.log("fieldName", fieldName);

    // selon le nom du champ de formulaire lié à l'imput de type file, on n'enregistrera dans des dossiers différents
    if (fieldName == "mediaQuestion") {
      let storageRef = ref(this.storage, 'images/questions/' + fieldName + '_' + file.name);
      uploadBytes(storageRef, file)
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
    else {
      let storageRef = ref(this.storage, 'images/questions/responses/' + fieldName + '_' + file.name);
      uploadBytes(storageRef, file)
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
  }


  getMediasQuestions(): any {
    // Create a reference under which you want to list 
    let mediasQuestionsRef = ref(this.storage, 'images/questions');
    // Find all the prefixes and items.
    listAll(mediasQuestionsRef)
      .then(async response => {
        console.log("listAll response for mediasQuestions", response);
        for (let item of response.items) {
          let url = await getDownloadURL(item);
          console.log("url renvoyée en boucle", url);
          this.mediaQuestions.push(url)
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return this.mediaQuestions


  }

  getMediasResponses(): any {
    // Create a reference under which you want to list 
    let mediasResponsesRef = ref(this.storage, 'images/questions/responses');
    // Find all the prefixes and items.
    listAll(mediasResponsesRef)
      .then(async response => {
        console.log("listAll response for mediasQuestions", response);
        for (let item of response.items) {
          let url = await getDownloadURL(item);
          console.log("url renvoyée en boucle", url);
          this.mediaResponses.push(url)
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return this.mediaResponses


  }


}






