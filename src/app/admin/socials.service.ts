import { Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { deleteObject, getDownloadURL, listAll, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

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
  // mediasResponsesById: any = []
  // on part ici de l'hypothèse où on en a plusieurs
  // mediaQuestionById: any = []

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


  getMediasQuestions(): any {
    // Create a reference under which you want to list 
    let mediasQuestionsRef = ref(this.storage, 'images/squestions');
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
    let mediasResponsesRef = ref(this.storage, 'images/squestions/responses');
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

  // async getMediasResponsesById(id: string) {
  //   const mediasResponsesById: any[]=[]
  //   let mediasResponsesRef = ref(this.storage, 'images/squestions/responses');
  //   listAll(mediasResponsesRef)
  //     .then(async response => {
  //       for (let item of response.items) {
  //         console.log("esssai recuperation media by id", item.fullPath.includes(id));
  //         item.fullPath.includes(id) === true ? mediasResponsesById.push( await getDownloadURL(item)) : undefined
  //         console.log("mediaREspnsesById depuis service !!!!!!!!!!!", mediasResponsesById);
  //       }

  //     }).catch((error) => {
  //       // Uh-oh, an error occurred!
  //     });

  //   return (mediasResponsesById)
  // }

  getMediasResponsesById(id: string) {
    const mediasResponsesById: any[] = []
    let mediasResponsesRef = ref(this.storage, 'images/squestions/responses');
    listAll(mediasResponsesRef)
      .then(async response => {
        for (let item of response.items) {
          console.log("esssai recuperation media by id", item.fullPath.includes(id));
          item.fullPath.includes(id) === true ? mediasResponsesById.push(await getDownloadURL(item)) : undefined
          console.log("mediaREspnsesById depuis service !!!!!!!!!!!", mediasResponsesById);
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return (mediasResponsesById)
  }


  getMediaQuestionById(id: string) {
    const mediaQuestionById: any[] = []
    // Create a reference under which you want to list 
    let mediasQuestionsRef = ref(this.storage, 'images/squestions');
    listAll(mediasQuestionsRef)
      .then(async response => {
        // console.log("listAll medias for social questions", response);
        for (let item of response.items) {
          // console.log("esssai recuperation media question sociale by id", item.fullPath.includes(id));
          item.fullPath.includes(id) == true ? mediaQuestionById.push(await getDownloadURL(item)) : ""
          console.log("mon media Question pour l'id", mediaQuestionById);
        }

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

    return (mediaQuestionById)

  }

  getSocialQuestions() {
    let $questionsRef = collection(this.firestore, "squestions");
    return collectionData($questionsRef, { idField: "id" }) as Observable<any[]>
  }

  getSocialQuestion(id: string) {
    let $questionRef = doc(this.firestore, "squestions/" + id)
    return docData($questionRef, { idField: 'id' }) as Observable<any>;
  }


  deleteMedia(fieldName: any) {
    console.log("fichier à supprimer", fieldName);
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


  // à la différence de createQuestion qui répond au submit form initial, updateQuestion qui répond à updateForm n'a pas besoin (?) d'être async car on a déjà id ...
  updateSocialQuestion(id: string, question: any, allFilesToUpdate: any) {

    console.log("question ou les valeurs du formulaire", question);
    console.log('object.values allFilesToUpdate', Object.values(allFilesToUpdate));


    // toute recherche du type de fichier est maintenant faite en amont et la valeur de isVideo récupérée par le service

    console.log("question ou les valeurs du formulaire augmentées de isVideo avant setDoc", question);
    let $questionRef = doc(this.firestore, "squestions/" + id);

    setDoc($questionRef, question).then(response => console.log(response))

    for (let myFile of allFilesToUpdate) {
      this.uploadFiles(myFile[0], myFile[1], id)
    }

  }




}