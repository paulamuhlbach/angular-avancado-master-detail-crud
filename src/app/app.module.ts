import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CategoriesModule } from './pages/categories';
import { EntriesModule } from './pages/entries';
import { ReportsModule } from './pages/reports/reports.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    AppRoutingModule,
    CategoriesModule,
    EntriesModule,
    ReportsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
