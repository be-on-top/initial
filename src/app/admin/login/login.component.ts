import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
// pour changer un peu, on va faire des reactiive forms !!!!
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formLogin: FormGroup;
  isAuthentificated:boolean = false;

  constructor(private service: AuthService, private router: Router) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    })

  }
  ngOnInit(): void {

  }

  onSubmit() {
    this.service.login(this.formLogin.value)
      .then(response => {
        console.log(response);
        alert("Login Success ! ");
        this.isAuthentificated = true;
        console.log("isAuthenticated", this.isAuthentificated);
        
        this.router.navigate(['']);
      })
      .catch(error => console.log(error));
  }

  onClick() {
    this.service.loginWithGoogle()
      .then(response => {
        console.log(response);
        this.router.navigate(['']);
      })
      .catch(error => console.log(error))
  }

}
