import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Evaluators } from '../../evaluators';
import { EvaluatorsService } from '../../evaluators.service';

@Component({
  selector: 'app-evaluators-list',
  templateUrl: './evaluators-list.component.html',
  styleUrls: ['./evaluators-list.component.css']
})

export class EvaluatorsListComponent implements OnInit {
  // Will be an object of type Evaluators
  allEvaluators?:Evaluators[]


  constructor(private router:Router, private service:EvaluatorsService){

  }

  ngOnInit(): void {
    this.getEvaluators();
  }

  getEvaluators(){
    this.allEvaluators=this.service.getEvaluators();
  }

  deleteEvaluator(evaluator:any){
    this.allEvaluators=this.service.deleteEvaluator(evaluator);
    this.allEvaluators=this.service.getEvaluators();
  }

  

  


}
