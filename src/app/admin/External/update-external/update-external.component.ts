import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ExternalsService } from '../../externals.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-external',
  templateUrl: './update-external.component.html',
  styleUrls: ['./update-external.component.css']
})
export class UpdateExternalComponent {

  userId: any
  user: any = {}

  constructor(private service: ExternalsService, private ac: ActivatedRoute, private router: Router) {
    this.userId = this.ac.snapshot.params["id"];
    // on fait appel à getuser pour récupérer les entrées de l'existant. méthode qui pour memo renvoie un observable
    this.service.getExternal(this.userId).subscribe((data) => {
      // console.log("data from update-user component", data);
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

    // console.log("form update values", form.value);
    this.service.updateExternal(this.userId, form.value)
    // il faudra prévoir une redirection... 
    this.router.navigate(['/admin/external', this.userId])
  }


}
