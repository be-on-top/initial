import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from '@angular/fire/storage';
import { Firestore, collection, collectionData, docData, setDoc } from '@angular/fire/firestore';
import { addDoc, doc } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  image: any;
  mediaQuestions: string[]
  mediaResponses: string[]
  pathResponses: string[]

  // pour l'enregistrement des champs textuels
  // évaluateurs ne serait pas un tableau de type any mais un observable
  questions: any[] = [];
  result: any;
  isVideo: boolean = false;

  idMediaQuestion: string = ""
  idMediaOption1: string = ""
  idMediaOption2: string = ""
  idMediaOption3: string = ""
  idMediaOption4: string = ""

  registryNumbers: any = []

  constructor(private storage: Storage, private firestore: Firestore) {
    this.mediaQuestions = []
    this.mediaResponses = []
    this.pathResponses= []
  }


  async createQuestion(question: any, allFilesToUplad: []) {

    // let newQuestion if mediasAttached;
    if (question.mediaQuestion) {
      this.idMediaQuestion = `mediaQuestion${question.number}_${question.sigle}`
      this.questions = [this.idMediaQuestion, ...this.questions];
      // c'est là qu'on peut intégrer une différence selon le type de fichier détecté
      console.log(Object.values(allFilesToUplad)[0][2]);
      if (Object.values(allFilesToUplad)[0][2] == "video/mp4") {
        this.isVideo = true;
        console.log(this.isVideo);

      }

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
    let newQuestion = { created: Date.now(), idMediaQuestion: this.idMediaQuestion, idMediaOption1: this.idMediaOption1, idMediaOption2: this.idMediaOption2, idMediaOption3: this.idMediaOption3, idMediaOption4: this.idMediaOption4, isVideo: this.isVideo, ...question };
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

    // selon le nom du champ de formulaire lié à l'imput de type file, on enregistrera dans des dossiers différents
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
          console.log("voila la réponse avec getDownloaURL !!!!!!!!!!!!!!!!!!!!!!!!!!!", item);          

          // est-ce que c'était pertinent d'avoir l'url plutôt que le chemin ?
          let url = await getDownloadURL(item);
          console.log("url renvoyée en boucle", url);
          this.mediaResponses.push(url)
          // this.pathResponses.push(item.fullPath)
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return (this.mediaResponses)

  }

  getMediasResponsesPath(): any {
    // Create a reference under which you want to list 
    let mediasResponsesRef = ref(this.storage, 'images/questions/responses');
    // Find all the prefixes and items.
    listAll(mediasResponsesRef)
      .then(async response => {
        console.log("listAll path response for mediasQuestions", response);
        for (let item of response.items) {
          console.log("voila la réponse avec paths!!!!!!!!!!!!!!!!!!!!!!!!!!!", item.fullPath); 
          console.log("path renvoyée en boucle", item.fullPath);
          this.pathResponses.push(item.fullPath)
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return (this.pathResponses)
  }


  // getEvaluators(): Observable<Evaluators[]> {
  getQuestions() {
    let $evaluatorsRef = collection(this.firestore, "questions");
    return collectionData($evaluatorsRef, { idField: "id" }) as Observable<any[]>
  }

  getQuestion(id: string) {
    let $questionRef = doc(this.firestore, "questions/" + id)
    return docData($questionRef, { idField: 'id' }) as Observable<any>;
  }


  // à la différence de createQuestion qui répond au submit form initial, updateQuestion qui répond à updateForm n'a pas besoin (?) d'être async car on a déjà id ...
  updateQuestion(id: string, question: any, allFilesToUpdate: any) {

    // un peu comme pour la création
    console.log(Object.values(allFilesToUpdate)[0]);

    let $questionRef = doc(this.firestore, "questions/" + id);
    setDoc($questionRef, question)
    for (let myFile of allFilesToUpdate) {
      this.uploadFiles(myFile[0], myFile[1], id)
    }

  }


  deleteMedia(fieldName: any) {
    console.log("fichier à supprimerdfdfdfdsfdsfdsfdsfdsffdsffd", fieldName);
    // https://www.bezkoder.com/angular-14-firebase-storage/

    // Create a reference to the file to delete
    const desertRef = ref(this.storage, fieldName);

    // // Delete the file
    deleteObject(desertRef).then(() => {
      console.log("fichier supprimé");
      
    }).catch((error) => {
      console.log(error);
      
    });

  }


}






