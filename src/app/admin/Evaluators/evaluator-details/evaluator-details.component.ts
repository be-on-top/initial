import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluatorsService } from '../../evaluators.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-evaluator-details',
  templateUrl: './evaluator-details.component.html',
  styleUrls: ['./evaluator-details.component.css']
})
export class EvaluatorDetailsComponent {
  evaluatorId:any;
  evaluator:any

  // si l'admin partage avec manager la gestion des évaluateurs
  userRole:string|string[]|null=null

  constructor(private service:EvaluatorsService, private ac:ActivatedRoute, private router:Router, private authService:AuthService){
    this.evaluatorId=this.ac.snapshot.params["id"];
    this.service.getEvaluator(this.evaluatorId).subscribe(data=>{
      console.log("data de getEvaluator", data);
      this.evaluator=data
      return this.evaluator      
    })
    this.authService.getCurrentUserRole().subscribe(role=>this.userRole=role)

  }

  deleteEvaluator(evaluatorid:string){
    console.log(evaluatorid);
    
    this.service.deleteEvaluator(evaluatorid)
    this.router.navigate(['/admin/evaluators'])
  } 

}
