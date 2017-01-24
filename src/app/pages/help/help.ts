import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Email } from '../../models/email';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  email : Email;

  constructor(
    private emailService: EmailService,
    private toastCtrl: ToastController
  ) {
    this.email = new Email();
  }
  
  postEmail() {
    this.emailService.sendEmail(this.email);
    this.presentToast("Vous devez avoir une application mail avec une adresse configurée pour utiliser cette fonctionnalité");
  }

  presentToast(p_message) {
    let toast = this.toastCtrl.create({
      message: p_message,
      duration: 3000
    });
    toast.present();
  }
}
