import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../admin/settings.service';
import { SlugService } from '../slug.service';

@Component({
  selector: 'app-trades-minimal',
  templateUrl: './trades-minimal.component.html',
  styleUrls: ['./trades-minimal.component.css']
})
export class TradesMinimalComponent implements OnInit {

  query: string = '';

  ungroupedTrades: any[] = [];
  groupedTrades: { key: string, value: any[] }[] = [];

  tradesData: any[] = [];

  constructor(public slugService: SlugService, private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.settingsService.getTrades().subscribe(data => {
      this.tradesData = data || [];

      this.groupTrades();
    });
  }

  private groupTrades() {
    const groupedMap = new Map<string, any[]>();
    this.ungroupedTrades = [];

    this.tradesData.forEach(trade => {
      if (trade.parentCategory && trade.parentCategory.trim() !== '') {
        if (!groupedMap.has(trade.parentCategory)) {
          groupedMap.set(trade.parentCategory, []);
        }
        groupedMap.get(trade.parentCategory)?.push(trade);
      } else {
        this.ungroupedTrades.push(trade);
      }
    });

    // Conversion en tableau pour *ngFor dans le template
    this.groupedTrades = Array.from(groupedMap.entries()).map(([key, value]) => ({ key, value }));
  }

}
