import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feedback-messages',
  templateUrl: './feedback-messages.component.html',
  styleUrls: ['./feedback-messages.component.css']
})
export class FeedbackMessagesComponent {

  @Input() feedbackMessages:any
  @Input() isSuccessMessage:any

}
