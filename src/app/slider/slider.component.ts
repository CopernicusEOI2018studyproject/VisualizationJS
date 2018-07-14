import { Component, Input, EventEmitter, OnInit, OnChanges, Output } from '@angular/core';
import { FloodService } from './../services/flood.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  providers: [FloodService]
})
export class SliderComponent implements OnInit {

  // @Input()
  // public 

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

  constructor(
    private floodService: FloodService,
  ) { }

  ngOnInit() {
    this.getAllFileNames();
  }
  
  private getAllFileNames() {
    console.log('getAllDatasetNames');

    this.floodService.getList()
      .subscribe(
        res => {
          console.log(res);
          if (res.length > 0) {
            this.fileNames = res;
            this.disabled = false;
            this.max = this.fileNames.length-1;
            this.fileNameIdx = this.max;
          } else {
            this.disabled = true;
          }
        },
        err => {
          console.log(err);
          alert('error getAllDatasetNames');
        }
      )
  }

  private fireMyEvent(data) {
    console.log('fireMyEvent()');
    this.onChangeFilename.emit(this.fileNames[this.fileNameIdx]);
  }

}
