import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, getStorage, uploadBytesResumable, getMetadata, listAll } from '@angular/fire/storage';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  // public file: any = {};


  // Create the file metadata
  /** @type {any} */
  metadata = {
    contentType: 'image/jpeg'
  };


  image: any;
  questions:string[]

  constructor(private storage: Storage) {
    this.questions = []



  }



  // uploadFiles(file: any) {
  //   // nouvelle syntaxe ok 
  //   let storageRef = ref(this.storage, file );
  //   uploadBytes(storageRef, file).then((snapshot) => {
  //     console.log('Uploaded file!');
  //   });
  // }


  uploadFiles(file: any) {

    // Upload file and metadata to the object 'images/mountains.jpg'
    let storageRef = ref(this.storage, 'images/' + file.name);
    uploadBytes(storageRef, file)
    .then((response)=>console.log(response))
    .catch((error)=>console.log(error))



  }


  getImages():any {
    // Create a reference under which you want to list 
    // Créée une référencce pour le dossier qu'on soubaite scanner

    let imagesRef = ref(this.storage, 'images');
    // let questions: any = []

    // Find all the prefixes and items.
    listAll(imagesRef)
      .then(async response => {
        console.log("listAll response", response);
        // this.questions = [];
        for (let item of response.items){
          let url = await getDownloadURL(item);
          console.log("url renvoyée en boucle", url);          
          this.questions.push(url)
          console.log("questions en fin de boucle", this.questions);
          

          
        }
        // response.prefixes.forEach((folderRef) => {
        //   // All the prefixes under listRef.
        //   // You may call listAll() recursively on them.
        //   console.log("le dossier images", folderRef);

        // });
        // res.items.forEach((itemRef) => {
        //   // All the items under listRef.
        //   console.log("une image de la liste", itemRef);
        //   const url = await getDownloadURL(itemRef); console.log("url associée", url)
        //   this.questions.push(url)
        console.log(this.questions);
        // return this.questions


        // });

      }).catch((error) => {
        // Uh-oh, an error occurred!
      });

      return this.questions
  }


}






