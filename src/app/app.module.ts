import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CategoriesModule } from './pages/categories';
import { EntriesModule } from './pages/entries';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDatabase } from './in-memory-database';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CategoriesModule,
    EntriesModule,
   HttpClientInMemoryWebApiModule.forRoot(InMemoryDatabase)
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
