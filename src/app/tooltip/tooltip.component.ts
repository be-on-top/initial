// tooltip.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  template: `
      <span class="trade-hover"
          [title]="info"
          (mouseenter)="onMouseEnter()"
          (mouseleave)="onMouseLeave()">
          {{ text }}<i class="bi bi-info-square-fill ms-2"></i>
      </span>

  `,
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent {
  @Input() text: string | undefined;
  @Input() info: string | null = "";

  isHovered: boolean = false;

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
}
