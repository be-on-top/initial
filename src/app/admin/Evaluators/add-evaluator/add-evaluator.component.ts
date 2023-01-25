import { Component, OnInit } from '@angular/core';
import { EvaluatorsService } from '../../evaluators.service';


@Component({
  selector: 'app-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.css']
})
export class AddEvaluatorComponent implements OnInit {

  constructor(private service:EvaluatorsService) { }

  ngOnInit(): void {
  }

  addEvaluator(form:any){
    console.log(form.value);
    this.service.createEvaluator(form.value); 
    form.reset();   
  }

  

}
