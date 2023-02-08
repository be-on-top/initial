import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
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

  constructor() { }

  ngOnInit(): void {
  }

// Create a reference to 'mountains.jpg'
// this.mediaOption1 = ref(storage, 'mountains.jpg');

// Create a reference to 'images/mountains.jpg'
// const mountainImagesRef = ref(storage, 'images/mountains.jpg');

// While the file names are the same, the references point to different files
// mountainsRef.name === mountainImagesRef.name;           // true
// mountainsRef.fullPath === mountainImagesRef.fullPath;   // false 


submitForm(form:NgForm){
  console.log(form.value);
  
}

}








