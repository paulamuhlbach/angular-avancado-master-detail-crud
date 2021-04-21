import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CategoriesModule } from './pages/categories';
import { EntriesModule } from './pages/entries';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    AppRoutingModule,
    CategoriesModule,
    EntriesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
