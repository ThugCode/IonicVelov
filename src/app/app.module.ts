import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { StationService } from './station.service';
import { LocalisationPage } from '../pages/localisation/localisation';
import { AlertesPage } from '../pages/alertes/alertes';
import { FavoritesDetailPage } from '../pages/favorites-detail/favorites-detail';
import { FavoritesListPage } from '../pages/favorites-list/favorites-list';

@NgModule({
  declarations: [
    MyApp,
    LocalisationPage,
    AlertesPage,
    FavoritesDetailPage,
    FavoritesListPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LocalisationPage,
    AlertesPage,
    FavoritesDetailPage,
    FavoritesListPage
  ],
  providers: [
    StationService
  ]
})
export class AppModule {}
