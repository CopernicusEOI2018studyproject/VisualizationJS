import { Component, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';

@Component({
  selector: 'app-customsnackbar',
  templateUrl: './customsnackbar.component.html',
  styles: [`
    .custom-snackbar {
      color: black;
    }
  `],
})
export class CustomsnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
  public message = this.data;
}


@Component({
  selector: 'app-customsnackbar',
  templateUrl: './customsnackbar.component.html',
  styles: [`
    .custom-snackbar {
      color: black;
    }
  `],
})
export class WarningsnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
  public message = 'Warning: ' + this.data;
}


@Component({
  selector: 'app-customsnackbar',
  templateUrl: './customsnackbar.component.html',
  styles: [`
    .custom-snackbar {
      color: black;
    }`
  ],
})
export class SuccesssnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
  public message = 'Success: ' + this.data;
}
