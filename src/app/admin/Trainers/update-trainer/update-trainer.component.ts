import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainersService } from '../../trainers.service';

@Component({
  selector: 'app-update-trainer',
  templateUrl: './update-trainer.component.html',
  styleUrls: ['./update-trainer.component.css']
})
export class UpdateTrainerComponent {
  userId: any
  user: any = {}
  selectedSigles: string[] = []

  constructor(private service: TrainersService, private ac: ActivatedRoute, private router: Router) {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à geTrainer pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getTrainer(this.userId).subscribe((data) => {
      console.log("data depuis update-user component", data);
      this.user = data
    })

  }

  ngOnInit(): void {
  }

  updateUser(form: NgForm) {
    // on vérifie la validité du formulaire
    if (!form.valid) {
      console.log('form valid');
      return
    }

    console.log("form update values", form.value);
    this.service.updateTrainer(this.userId, form.value)
    this.router.navigate(['/admin/trainer', this.userId])
  }

  // pour affecation métiers
  checkIfSelected(sigle: any) {
    console.log(sigle);
    this.selectedSigles = [...this.selectedSigles, sigle]
  }



}
