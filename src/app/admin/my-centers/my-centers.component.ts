import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CentersService } from '../centers.service';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';

interface CenterLink {
  name: string;
  cp: string;
  url: string;
}

@Component({
  selector: 'app-my-centers',
  templateUrl: './my-centers.component.html',
  styleUrls: ['./my-centers.component.css']
})

export class MyCentersComponent implements OnInit {
  cpArray: string[] = [];
  centersUrl: CenterLink[] = [];
  isLoading: boolean = true;

  userUid: string = '';
  userRole?: any

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private regionalService: CentersService,
    private router: Router
  ) {


  }

  ngOnInit(): void {
    // Récupérer l'UID et le rôle de l'utilisateur
    this.authService.getCurrentUserInfo().subscribe(userInfo => {
      this.userRole = userInfo?.role ?? null;
      this.userUid = userInfo?.uid ?? '';

      if (this.userUid && this.userRole === 'referent') {
        // Récupérer cpArray depuis le compte utilisateur
        this.userService.getUser(this.userUid).subscribe(data => {
          this.cpArray = data.cp || [];
          this.loadCenters();
        });
      } else {
        this.isLoading = false;
      }
    });
  }

  private loadCenters() {
    if (!this.cpArray.length) {
      this.isLoading = false;
      return;
    }

    this.regionalService.getCenters().pipe(
      map(centers =>
        centers
          .filter(center => this.cpArray.includes(center.cp) && center.status)
          .map(center => ({
            name: center.name,
            cp: center.cp,
            url: `/center/${center.id}`
          }))
      )
    ).subscribe(centersUrl => {
      this.centersUrl = centersUrl;
      this.isLoading = false;
    });
  }
}
