import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { loggedIn } from '@angular/fire/auth-guard';
import { Auth } from '@angular/fire/auth';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';
import { EvaluatorsService } from '../admin/evaluators.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user?: any;
  ui: string | undefined = ''

  constructor(private auth: Auth, private authService: AuthService, private evaluatorService: EvaluatorsService, private activatedRoute: ActivatedRoute, private router: Router) {
    const userKey = this.auth.currentUser?.uid;
    console.log("userKey", userKey);
    this.ui = userKey

  }

  ngOnInit(): void {
    // getUserId ne sert à priori à rien si on peut récupérer l'id grâce à this.auth.currentUser !!!
    // this.authService.getUserId();
    this.getData()
  }

  getData() {
    // const dbInstance = collection(this.firestore, 'evaluators');
    const userKey = this.auth.currentUser?.uid;
    console.log("userKey", userKey);
    this.ui = userKey

  }


  onClick() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/register']);
      })
      .catch(error => console.log(error));
  }


}
