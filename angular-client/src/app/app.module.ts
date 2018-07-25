import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CustomsnackbarComponent, WarningsnackbarComponent, SuccesssnackbarComponent } from './customsnackbar/customsnackbar.component';
import { MapComponent } from './map/map.component';
import { SliderComponent } from './slider/slider.component';

import { EmitterService } from './emitter.service';
import { BrowserXhr } from '@angular/http';
import { CustExtBrowserXhr } from './brosXhs';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CustomsnackbarComponent,
    WarningsnackbarComponent,
    SuccesssnackbarComponent,
    MapComponent,
    SliderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    LeafletModule.forRoot(),
    MaterialModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    CustomsnackbarComponent,
    WarningsnackbarComponent,
    SuccesssnackbarComponent
  ],
  providers: [
    {provide: BrowserXhr, useClass:CustExtBrowserXhr},
    EmitterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
