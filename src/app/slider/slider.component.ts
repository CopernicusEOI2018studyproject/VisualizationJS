import { Component, Input, EventEmitter, OnInit, OnChanges, Output } from '@angular/core';
import { FloodService } from './../services/flood.service';
import { MatSnackBar } from '@angular/material';
import { CustomsnackbarComponent, WarningsnackbarComponent, SuccesssnackbarComponent } from './../customsnackbar/customsnackbar.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  providers: [FloodService]
})

export class SliderComponent implements OnInit {

  @Output()
  public onChangeFilename: EventEmitter<String> = new EventEmitter();
  
  @Output()
  public onChangeSelection: EventEmitter<String> = new EventEmitter();
  
  @Output()
  public onChangeHighlighting: EventEmitter<Number> = new EventEmitter();

  public autoTicks = false;
  public disabledSelection = false;
  public invert = false;
  public max = 1;
  public min = 0;
  public showTicks = false;
  public step = 1;
  public thumbLabel = false;
  public fileNameIdx = 0;
  private highlight = 50;
  public vertical = false;
  public fileNames = ["no data selected"];
  public selectionList = ['Biggest', '8hours'];
  public stationsSelection = 'Biggest';
  public selectedFileIndex;
  private options: FormGroup;

  private dateStrings = ["no data selected"];
  private selectedFile;
  private original = [];

  constructor(
    private floodService: FloodService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.options = fb.group({
      highlight: 50,
    });
   }

  ngOnInit() {
    this.getAllFileNames();
  }

  ngOnChanges(changes: any) {
    // console.log(changes);
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
              this.selectedFile = this.fileNames[this.fileNameIdx];
              this.fileNames = res;
              this.dateStrings = [];
              this.fileNames.forEach((el) => {
                this.dateStrings.push(this.parseDate(el + ':00:00Z'));
              })
              this.updateFilenamelist();
              this.disabledSelection = true;
            } else {
              this.disabledSelection = false;
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

  private updateFilenamelist() {
    if (this.disabledSelection) {
      this.max = this.fileNames.length - 1;
      this.fileNameIdx = this.max;
      this.selectedFile = this.fileNames[this.fileNameIdx];
    } else {
      let currentIdx = this.fileNames.findIndex((el) => el === this.selectedFile);

      if (currentIdx < 0) {
        this.fileNameIdx = this.fileNames.length - 1;
      } else {
        this.fileNameIdx = currentIdx;
      }
      this.max = this.fileNames.length - 1;
    }
  }

  private startRequest(data) {
    if (this.selectedFileIndex !== this.fileNameIdx) {
      this.selectedFileIndex = this.fileNameIdx;
      this.snackBar.openFromComponent(CustomsnackbarComponent, {
        data: 'Start requesting data ...',
        panelClass: ['snack-bar-default'],
        duration: 3000,
      });
      // this.parseDate(this.fileNames[this.fileNameIdx] + ':00:00Z');
      this.disabledSelection = true;
      this.onChangeFilename.emit(this.original[this.fileNameIdx]);
    } else {
      this.snackBar.openFromComponent(WarningsnackbarComponent, {
        data: 'Dataset already loaded.',
        panelClass: ['snack-bar-warning'],
        duration: 3000,
      });
    }
  }

  private changeSelection(selection) {
    this.onChangeSelection.emit(selection);
  }

  private parseDate(string) {
    let date = new Date(string);
    let output = date.getUTCDate() + '.' + (date.getUTCMonth()+1) + '.' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':00:00';
    return output;
  }

  private changeHighlighting(value) {
    // this.highlight = value;
    console.log(this.options);
    this.onChangeHighlighting.emit(this.options.value.highlight);
  }

}
