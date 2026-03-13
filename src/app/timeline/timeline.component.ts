import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements AfterViewInit {

  ngAfterViewInit() {

  const items = document.querySelectorAll('.timeline li');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {

      if(entry.isIntersecting){
        entry.target.classList.add('show');
      }

    });
  }, {
    threshold: 0.2
  });

  items.forEach(item => observer.observe(item));

}

}
