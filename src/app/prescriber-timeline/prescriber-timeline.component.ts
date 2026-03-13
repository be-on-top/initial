import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-prescriber-timeline',
  templateUrl: './prescriber-timeline.component.html',
  styleUrls: ['./prescriber-timeline.component.css']
})
export class PrescriberTimelineComponent implements AfterViewInit {
  
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
