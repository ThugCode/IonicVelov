import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { EmailService } from '../../services/email.service';
import { Email } from '../../models/email';

const TEXT_ENABLE_TO_SEND = "Vous devez avoir une application mail avec une adresse configurée pour utiliser cette fonctionnalité.";
const TEXT_MISSING_ARGUMENT = "Veuillez saisir un type de bug et l'incident que vous voulez reporter avec d'envoyer."

@Component({
  selector        : 'page-help',
  templateUrl     : 'help.html'
})

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.2
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
export class HelpPage {

  email : Email;

  constructor(
    private emailService  : EmailService,
    private toastCtrl     : ToastController
  ) {
    this.email = new Email();
    this.email.body = "";
    this.email.subject = "";
  }
  
  /***
   * Display email application to send an email to report a bug
   * 
   */
  postEmail() {

    if(this.email.body == "" 
    || this.email.subject == "") {
        this.presentToast(TEXT_MISSING_ARGUMENT);
        return;
    }
    
    this.emailService.sendEmail(this.email);

    this.emailService.ableToEmail().then(success => {
      if(!success) {
        this.presentToast(TEXT_ENABLE_TO_SEND);
      }
    });

    this.email.body = "";
    this.email.subject = "";
  }

  /***
   * Display a toast with a specific message during 4 secondes
   * 
   * @param p_message : string
   */
  presentToast(p_message) {
    let toast = this.toastCtrl.create({
      message: p_message,
      duration: 4000
    });
    toast.present();
  }
}
