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
  authStatus?: any;

  constructor(private auth: Auth, private authService: AuthService, private evaluatorService: EvaluatorsService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    // getUserId ne sert à priori à rien si on peut récupérer l'id grâce à this.auth.currentUser !!!
    this.authService.getUserId();
    this.authService.getData()
    // retourne this.ui tout de suite après la connexion. undefined plus tard...
    // console.log("log de ui", this.ui);
    // tests ok pour information, mais ne semble pas être très utile 
    this.authService.getToken()?.then(res => console.log(res.token))
    // fonctionne parfaitement ! 
    this.authService.authStatusListener()
  }


  onClick() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/register']);
      })
      .catch(error => console.log(error));
  }


}
