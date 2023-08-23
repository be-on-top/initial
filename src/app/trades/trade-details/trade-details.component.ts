import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'src/app/admin/settings.service';
import { Trade } from 'src/app/admin/trade';

@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.css']
})
export class TradeDetailsComponent implements OnInit {

  // si on passe effectivement des paramètres au router au lieu de faire un input 
  tradeId: string = ""
  tradeData!: Trade
  firstValuesSum:number=0


  constructor(private service: SettingsService, private ac: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.tradeId = this.ac.snapshot.params["id"]
    this.service.getSigle(this.tradeId).subscribe(data => {

      console.log("metier récupéré via le paramètre de route", data)
      this.tradeData = data

      // Pour extraire et additionner les premières valeurs des tableaux associés aux clés spécifiques dans l'objet tradeData.durations, vous pouvez utiliser TypeScript avec Angular de la manière suivante :

      const keysToExtractFrom = Object.keys(this.tradeData.durations)

      this.firstValuesSum = keysToExtractFrom.reduce((sum, key) => {
        const valuesArray = this.tradeData.durations[key];
        if (valuesArray && valuesArray.length > 0) {
          sum += valuesArray[0];
        }
        return sum;
      }, 0);

      console.log("Sum of first values:", this.firstValuesSum);
    }

    )

  }

}
