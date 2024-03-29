import { Component } from '@angular/core';
import { ConsentService } from '../consent.service';

@Component({
  selector: 'app-rgpd',
  templateUrl: './rgpd.component.html',
  styleUrls: ['./rgpd.component.css']
})
export class RgpdComponent {

  constructor(public consentService: ConsentService) {


  }

}
