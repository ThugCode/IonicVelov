import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Email } from '../../models/email';

@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  email : Email;

  constructor(
    private emailService: EmailService
  ) {
    this.email = new Email();
  }
  
  postEmail() {
    this.emailService.sendEmail(this.email);
  }
}
