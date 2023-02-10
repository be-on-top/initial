import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../../questions.service';
// import { getStorage, ref } from "firebase/storage";
// import { expand } from 'rxjs';



@Component({
  selector: 'app-prior-form',
  templateUrl: './prior-form.component.html',
  styleUrls: ['./prior-form.component.css']
})
export class PriorFormComponent implements OnInit {
  question: string = "";
  mediaQuestion: any;
  mediaOption1: any;
  option1: string = "";
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  comment2: string = "";
  mediaOption3: any;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  option4: string = "";
  comment4: string = "";
  // Create a root reference

  constructor(private service: QuestionsService) { }

  fileIsUploading = false;
  fileUrl!: string;
  fileUploaded = false;

  ngOnInit(): void {
  }

  // Create a reference to 'mountains.jpg'
  // this.mediaOption1 = ref(storage, 'mountains.jpg');

  // Create a reference to 'images/mountains.jpg'
  // const mountainImagesRef = ref(storage, 'images/mountains.jpg');

  // While the file names are the same, the references point to different files
  // mountainsRef.name === mountainImagesRef.name;           // true
  // mountainsRef.fullPath === mountainImagesRef.fullPath;   // false 


  submitForm(form: NgForm) {
    console.log(form.value.mediaQuestion);
    // let varPath='${form.value.mediaQuestion.name}'
    // this.service.uploadFiles(form.value.mediaQuestion)

if (form.value.mediaQuestion) {
  let varPath=`images/${form.value.mediaQuestion}_${form.value.sigle}_question`
  this.service.uploadFiles(varPath)
  
}

    // form.value.mediaQuestion ? this.service.uploadFiles(form.value.mediaQuestion) : console.log("pas de fichier joint");

    // form.value.mediaOption1 ? this.service.uploadFiles(form.value.mediaOption1) : console.log("pas de fichier joint");
    // form.value.mediaOption2 ? this.service.uploadFiles(form.value.mediaOption2) : console.log("pas de fichier joint");
    // form.value.mediaOption3 ? this.service.uploadFiles(form.value.mediaOption3) : console.log("pas de fichier joint");
    // form.value.mediaOption4 ? this.service.uploadFiles(form.value.mediaOption4) : console.log("pas de fichier joint");

  }



  // méthode qui permettra de lier le  <input type="file">  (que vous créerez par la suite) à la méthode  onUploadFile()  :

  detectFiles(event:any) {
    this.onUploadFile(event.target.files[0]);
}

  // méthode qui déclenchera  uploadFile()  et qui en récupérera l'URL retourné :
  onUploadFile(file: File) {
    this.fileIsUploading = true;
    this.service.uploadFiles(file);
    
}


}








