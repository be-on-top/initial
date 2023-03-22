import { Component, OnInit } from '@angular/core';
// import { of } from 'rxjs';
import { AuthService } from '../admin/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.authService.getUserId();
  }


}
