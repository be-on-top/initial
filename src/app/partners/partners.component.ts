import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { Partner } from '../admin/partner';
import { SettingsService } from '../admin/settings.service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css'],
  standalone: true,
  imports: [NgFor, NgIf]
})
export class PartnersComponent implements OnInit {

  partners: Partner[] = [];

  constructor(
    private service: SettingsService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {

    // SEO : exécuté immédiatement, sans attendre Firebase
    this.title.setTitle(
      'Partenaires de nos parcours de formation et d\'accompagnement | Be-On-Top'
    );

    this.meta.updateTag({
      name: 'description',
      content:
        'Be-On-Top réunit organismes de formation, entreprises, spécialistes de l\'intérim et partenaires de l\'accompagnement via un parcours de formation personnalisé des apprenants.'
    });

    // Canonical fixe de la page
    const canonicalUrl = 'https://be-on-top.io/partners';

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    if (canonical.href !== canonicalUrl) {
      canonical.href = canonicalUrl;
    }

    // Les données peuvent ensuite être chargées
    this.service.fetchPartners().subscribe(data => {
      this.partners = data;
      console.log('partenaires récupérés', this.partners);
    });
  }
}