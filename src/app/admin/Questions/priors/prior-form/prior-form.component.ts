import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuestionsService } from '../../questions.service';


@Component({
  selector: 'app-prior-form',
  templateUrl: './prior-form.component.html',
  styleUrls: ['./prior-form.component.css']
})

export class PriorFormComponent implements OnInit {
  question: string = "";
  number: number = 0;
  mediaQuestion: any;
  mediaOption1: any;
  option1: string = "";
  optScoring1: boolean = false;
  comment1: string = "";
  mediaOption2: any;
  option2: string = "";
  optScoring2: boolean = false;
  comment2: string = "";
  mediaOption3: any;
  optScoring3: boolean = false;
  option3: string = "";
  comment3: string = "";
  mediaOption4: any;
  optScoring4: boolean = false;
  option4: string = "";
  comment4: string = "";
  mediaOption5: any;
  option5: string = "";
  comment5: string = "";
  // Create a root reference

  numbers: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  registryNumbers: any[] = []

  constructor(private service: QuestionsService) { }

  fileIsUploading = false;
  fileUrl!: string;
  fileUploaded = false;

  totalMediasFiles: number = 0
  arrayFilesToUpload: any = []

  ngOnInit(): void {
    this.service.getQuestions().subscribe(data => {
      console.log(data);
      for (let n of data) {
        this.registryNumbers = [...this.registryNumbers, Number(n.number)]
        // console.log(this.registryNumbers);
        this.numbers=this.numbers.filter(element=>{
          return element!=n.number});          
        // console.log("result", this.numbers);
      }
      return this.numbers
    })
  }

  async submitForm(form: NgForm) {
    console.log(form.value);
    this.service.createQuestion(form.value, this.arrayFilesToUpload);

  }

  detectFiles(event: any, fieldName: any) {
    this.totalMediasFiles++;
    this.arrayFilesToUpload.push([event.target.files[0], fieldName.name])
    console.log("this.arrayFilesToUpload", this.arrayFilesToUpload);

    // this.onUploadFile(event.target.files[0], fieldName.name);
  }


}








