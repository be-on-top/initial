import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll } from '@angular/fire/storage';
import { Firestore, collection } from '@angular/fire/firestore';
import { addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  image: any;
  mediaQuestions: string[]
  mediaResponses: string[]

  // pour l'enregistrement des champs textuels
    // évaluateurs ne serait pas un tableau de type any mais un observable
    questions: any[] = [];
    result: any;

  constructor(private storage: Storage, private firestore:Firestore) {
    this.mediaQuestions = []
    this.mediaResponses = []
  }


  // let $questionsRef = collection(this.firestore, "questions");  addDoc($questionsRef , newQuestion)
  createQuestion(question: any) {

    // let newEvaluator = { id: Date.now(), ...evaluator };
    let newQuestion = { created: Date.now(), ...question };
    this.questions = [newQuestion, ...this.questions];
    console.log(this.questions);


    // enregistre dans Firestore pour premier test avec un collection questions qui elle aura de multiples propriétés
    let $questionsRef = collection(this.firestore, "questions");
    addDoc($questionsRef, newQuestion)

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

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






