import { Component } from '@angular/core';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})

export class UpdateUserComponent {

  userId: any
  user: any = {}
  selectedSigles: string[] = []

  constructor(private service: UsersService, private ac: ActivatedRoute, private router: Router) {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à getuser pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getUser(this.userId).subscribe((data) => {
      console.log("data from update-user component", data);
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
    this.service.updateUser(this.userId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/user', this.userId])
  }


}
