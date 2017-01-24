import { Injectable } from '@angular/core';
import { EmailComposer } from 'ionic-native';
import { Platform } from 'ionic-angular';

@Injectable()
export class EmailService {

    constructor(
        private platform: Platform
    ) {}

    ableToEmail():Promise<boolean> {
        return EmailComposer.isAvailable().then((available: boolean) =>{
            return available;
        }).catch(err => {
            return false;
        });
    }

    sendEmail(email) {

        email.app = "mailto";
        email.to = "leo.letourneur@etu.univ-lyon1.fr";
        email.isHtml = true;

        var re = /\n/gi;
        email.body = email.body.replace(re, "<br/>");
        email.body += "<br/><br/>---------Plateformes----------<br/>";
        email.body += this.platform.platforms().toString();
        email.body += "<br/>---------versions----------<br/>";
        email.body += JSON.stringify(this.platform.versions());
        
        EmailComposer.open(email);
    }
}