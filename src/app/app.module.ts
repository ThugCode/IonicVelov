import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { StationService } from './services/station.service';
import { PisteService } from './services/piste.service';
import { FileService } from './services/file.service';
import { EmailService } from './services/email.service';
import { LocalisationPage } from './pages/localisation/localisation';
import { AlertesPage } from './pages/alertes/alertes';
import { FavoritesDetailPage } from './pages/favorites-detail/favorites-detail';
import { FavoritesListPage } from './pages/favorites-list/favorites-list';
import { HelpPage } from './pages/help/help';


@NgModule({
  declarations: [
    MyApp,
    LocalisationPage,
    AlertesPage,
    FavoritesDetailPage,
    FavoritesListPage,
    HelpPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      backButtonText: 'Retour'
    }, {})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LocalisationPage,
    AlertesPage,
    FavoritesDetailPage,
    FavoritesListPage,
    HelpPage
  ],
  providers: [
    StationService,
    FileService,
    EmailService,
    PisteService
  ]
})
export class AppModule {}
