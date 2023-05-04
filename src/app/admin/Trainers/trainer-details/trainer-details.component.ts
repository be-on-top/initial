import { Component } from '@angular/core';
import { TrainersService } from '../../trainers.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})

export class TrainerDetailsComponent {
  userId: any;
  user: any

  constructor(private service: TrainersService, private ac: ActivatedRoute, private router: Router) {
    this.userId = this.ac.snapshot.params["id"];
    this.service.getTrainer(this.userId).subscribe(data => {
      console.log("data de getTrainer", data);
      this.user = data
      return this.user
    })

  }

  deleteTrainer(userId: string) {
    console.log(userId);
    this.service.deleteTrainer(userId)
    this.router.navigate(['/admin/trainers'])
  }

}
