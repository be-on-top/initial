import { AfterViewInit, Component } from '@angular/core';
import { Partner } from '../admin/partner';
import { SettingsService } from '../admin/settings.service';
import { NgClass, NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css'],
  standalone: true, // <--- AJOUTE ÇA
  imports: [NgFor,NgIf]
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
