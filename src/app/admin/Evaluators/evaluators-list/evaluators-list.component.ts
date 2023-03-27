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
  // Will be an object of type Evaluators ++++++ 
  // allEvaluators?:Evaluators[]
  // juste pour tests sur affichage (simplifier ultérieurement l'interface Evaluators...)
  allEvaluators?:any


  constructor(private router:Router, private service:EvaluatorsService){

  }

  ngOnInit(): void {
    this.getEvaluators();
  }

  getEvaluators(){
    // attention, puisque on récupère un observable depuis le service, on doit y souscrire
    // this.allEvaluators=this.service.getEvaluators(); devient donc nécessairement
    this.service.getEvaluators().subscribe(data=>{
      console.log("data de getEvaluators()", data)
      this.allEvaluators=data
      return this.allEvaluators
    })

  }

  deleteEvaluator(evaluatorid:string){
    console.log(evaluatorid);
    
    this.service.deleteEvaluator(evaluatorid)
    this.router.navigate(['/evaluators'])
    // .then(()=>{

    // })
    // .catch(()=>{
      
    // })
  }  


}
