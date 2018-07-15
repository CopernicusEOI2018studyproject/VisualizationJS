import { Component } from '@angular/core';

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
  public message = 'hello its me';
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
  public message = 'Warning: ';
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
  public message = 'Success: ';
}
