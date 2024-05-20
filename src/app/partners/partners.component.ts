import { AfterViewInit, Component } from '@angular/core';
import { Partner } from '../admin/partner';
import { SettingsService } from '../admin/settings.service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  // styleUrls: ['./partners.component.css']
})
export class PartnersComponent implements AfterViewInit {

  partners: Partner[] = []

  constructor(private service: SettingsService) {

  }
  ngAfterViewInit(): void {
    this.service.fetchPartners().subscribe(data => {
      this.partners = data
      console.log("partenaires récupérés", this.partners);

    })
  }

}
