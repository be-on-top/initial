import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';



@Component({
  selector: 'app-social-data',
  templateUrl: './social-data.component.html',
  styleUrls: ['./social-data.component.css'],
    standalone: true, // <--- AJOUTE ÇA
  imports: [
    CommonModule
  ]
})


export class SocialDataComponent {
  socialCards = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/beontop.io',
      icon: 'bi-facebook',
      description: 'Rejoignez-nous sur Facebook.'
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/company/be-on-top-io/posts/?feedView=all',
      icon: 'bi-linkedin',
      description: 'Suivez-nous sur Linkedin.'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/be_on_top.io/',
      icon: 'bi-instagram',
      description: 'Découvrez nos photos sur Instagram.'
    }
  ];

}




