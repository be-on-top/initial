import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';

@Component({
  selector: 'app-evaluator-details',
  templateUrl: './evaluator-details.component.html',
  styleUrls: ['./evaluator-details.component.css']
})
export class EvaluatorDetailsComponent {
  evaluatorId:any;
  evaluator:any

  constructor(private service:EvaluatorsService, private ac:ActivatedRoute, private router:Router){
    this.evaluatorId=this.ac.snapshot.params["id"];
    this.service.getEvaluator(this.evaluatorId).subscribe(data=>{
      console.log("data de getEvaluator", data);
      this.evaluator=data
      return this.evaluator      
    })

  }

  deleteEvaluator(evaluatorid:string){
    console.log(evaluatorid);
    
    this.service.deleteEvaluator(evaluatorid)
    this.router.navigate(['/admin/evaluators'])
  } 

}
