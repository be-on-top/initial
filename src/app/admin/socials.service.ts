import { Injectable } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SocialsService {

  mediaQuestions: string[]
  mediaResponses: string[]

  socialQuestions: any[] = []
  result: any;
  isVideo: boolean = false;

  registryNumbers: any = []
  mediasResponsesById: any = []
  // on part ici de l'hypothèse où on en a plusieurs
  mediaQuestionById: any = []

  constructor(private storage: Storage, private firestore: Firestore) {
    this.mediaQuestions = []
    this.mediaResponses = []
  }


  async createSocialQuestion(socialQuestion: any, allFilesToUplad: []) {

    // let newQuestion if mediasAttached;
    if (socialQuestion.mediaQuestion) {
      // c'est là qu'on peut intégrer une différence selon le type de fichier détecté
      console.log(Object.values(allFilesToUplad)[0][2]);
      if (Object.values(allFilesToUplad)[0][2] == "video/mp4") {
        this.isVideo = true;
        console.log(this.isVideo);

      }

    }

    // let newQuestion if no mediasAttached;
    let newSocialQuestion = { created: Date.now(), isVideo: this.isVideo, ...socialQuestion };
    this.socialQuestions = [newSocialQuestion, ...this.socialQuestions];
    // console.log(this.socialQuestions);

    let $questionsRef = collection(this.firestore, "squestions");
    await addDoc($questionsRef, newSocialQuestion).then((response) => {
      this.result = response.id;
      // console.log(response.id);
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



  uploadFiles(file: any, fieldName: string, idq: string) {
    console.log("fieldName", fieldName);

    // selon le nom du champ de formulaire lié à l'imput de type file, on enregistrera dans des dossiers différents
    if (fieldName == "mediaQuestion") {
      let storageRef = ref(this.storage, 'images/squestions/' + idq + '_' + fieldName + '_' + file.name);
      uploadBytes(storageRef, file)
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
    else {
      let storageRef = ref(this.storage, 'images/squestions/responses/' + idq + '_' + fieldName + '_' + file.name);
      uploadBytes(storageRef, file)
        .then((response) => console.log(response))
        .catch((error) => console.log(error))
    }
  }


}
