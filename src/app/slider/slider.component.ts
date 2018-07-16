import { Component, Input, EventEmitter, OnInit, OnChanges, Output } from '@angular/core';
import { FloodService } from './../services/flood.service';
import { MatSnackBar } from '@angular/material';
import { CustomsnackbarComponent, WarningsnackbarComponent, SuccesssnackbarComponent } from './../customsnackbar/customsnackbar.component';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  providers: [FloodService]
})

export class SliderComponent implements OnInit {

  @Output()
  public onChangeFilename: EventEmitter<String> = new EventEmitter();

  public autoTicks = false;
  public disabled = false;
  public invert = false;
  public max = 1;
  public min = 0;
  public showTicks = false;
  public step = 1;
  public thumbLabel = false;
  public fileNameIdx = 0;
  public vertical = false;
  public fileNames = ["no data selected"];

  private original = [];

  constructor(
    private floodService: FloodService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getAllFileNames();
  }

  public clickHandler(filename, index) {
    this.fileNameIdx = index;
  }

  private getAllFileNames() {
    try {
      this.floodService.getList()
        .map(res => {
          let output = res;
          output.forEach((el, idx, array) => {
            this.original.push(el);
            array[idx] = el.substring(0, el.length-5);
          });
          return output;
        },
        err => {
          console.log(err);
        }
        )
        .subscribe(
          res => {
            if (res.length > 0) {
              this.fileNames = res;
              this.disabled = false;
              this.max = this.fileNames.length - 1;
              this.fileNameIdx = this.max;
            } else {
              this.disabled = true;
            }
          },
          err => {
            this.snackBar.openFromComponent(WarningsnackbarComponent, {
              data: err,
              panelClass: ['snack-bar-warning'],
              duration: 3000,
            });
          }
        )
    } catch (err) {
      this.snackBar.openFromComponent(WarningsnackbarComponent, {
        data: err,
        panelClass: ['snack-bar-warning'],
        duration: 3000,
      });
    }
  }

  private fireMyEvent(data) {
    this.snackBar.openFromComponent(CustomsnackbarComponent, {
      data: 'Start requesting data ...',
      panelClass: ['snack-bar-default'],
      duration: 3000,
    });
    console.log(this.original);
    this.onChangeFilename.emit(this.original[this.fileNameIdx]);
  }

}
