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

  idMediaQuestion: string = ""
  idMediaOption1: string = ""
  idMediaOption2: string = ""
  idMediaOption3: string = ""
  idMediaOption4: string = ""

  constructor(private storage: Storage, private firestore: Firestore) {
    this.mediaQuestions = []
    this.mediaResponses = []
  }


  async createQuestion(question: any, allFilesToUplad: []) {

    // let newQuestion if mediasAttached;
    if (question.mediaQuestion) {
      this.idMediaQuestion = `mediaQuestion${question.number}_${question.sigle}`
      this.questions = [this.idMediaQuestion, ...this.questions];
    }
    if (question.mediaOption1) {
      this.idMediaOption1 = `mediaOption1${question.number}_${question.sigle}`
      this.questions = [this.idMediaOption1, ...this.questions];
    }
    if (question.mediaOption2) {
      this.idMediaOption2 = `mediaOption2${question.number}_${question.sigle}`
      this.questions = [this.idMediaOption2, ...this.questions];
    }
    if (question.mediaOption3) {
      this.idMediaOption3 = `mediaOption3${question.number}_${question.sigle}`
      this.questions = [this.idMediaOption3, ...this.questions];
    }
    if (question.mediaOption4) {
      this.idMediaOption4 = `mediaOption4${question.number}_${question.sigle}`
      this.questions = [this.idMediaOption4, ...this.questions];
    }


    // let newQuestion if no mediasAttached;
    let newQuestion = { created: Date.now(), idMediaQuestion: this.idMediaQuestion, idMediaOption1: this.idMediaOption1, idMediaOption2: this.idMediaOption2, idMediaOption3: this.idMediaOption3, idMediaOption4: this.idMediaOption4, ...question };
    this.questions = [newQuestion, ...this.questions];
    console.log(this.questions);

    let $questionsRef = collection(this.firestore, "questions");
    await addDoc($questionsRef, newQuestion).then((response) => {
      this.result = response.id;
      console.log(response.id);
      if (this.result) {
        for (let myFile of allFilesToUplad) {
          this.uploadFiles(myFile[0], myFile[1], this.result)
        }
      }
    })

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

  }

  uploadAllFiles(AllFilesToUplad: any) {
    console.log(AllFilesToUplad);

  }

  uploadFiles(file: any, fieldName: string, idq: string) {
    console.log("fieldName", fieldName);

    // selon le nom du champ de formulaire lié à l'imput de type file, on n'enregistrera dans des dossiers différents
    if (fieldName == "mediaQuestion") {
      let storageRef = ref(this.storage, 'images/questions/' + idq + '_' + fieldName + '_' + file.name);
      uploadBytes(storageRef, file)
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
    else {
      let storageRef = ref(this.storage, 'images/questions/responses/' + idq + '_' + fieldName + '_' + file.name);
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





