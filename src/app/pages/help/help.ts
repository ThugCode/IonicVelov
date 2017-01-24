import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Email } from '../../models/email';
import { ToastController } from 'ionic-angular';

const TEXT_ENABLE_TO_SEND = "Vous devez avoir une application mail avec une adresse configurée pour utiliser cette fonctionnalité.";
const TEXT_MISSING_ARGUMENT = "Veuillez saisir un type de bug et l'incident que vous voulez reporter avec d'envoyer."
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
    this.email.body = "";
    this.email.subject = "";
  }
  
  postEmail() {

    if(this.email.body == "" 
    || this.email.subject == "") {
        this.presentToast(TEXT_MISSING_ARGUMENT);
        return;
    }
    
    this.emailService.sendEmail(this.email);

    this.emailService.ableToEmail().then(success => {
      console.log(success);
      if(!success) {
        this.presentToast(TEXT_ENABLE_TO_SEND);
      }
    });

    this.email.body = "";
    this.email.subject = "";
  }

  presentToast(p_message) {
    let toast = this.toastCtrl.create({
      message: p_message,
      duration: 4000
    });
    toast.present();
  }
}
