import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @Output()
  public onChangeDataset: EventEmitter<String> = new EventEmitter();

  public title = 'Visualization of Stream Processed Data';
  public fileName;

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  private changeFilename(fileName: string) {
    console.log('changeFilename()');
    console.log(fileName);
    this.fileName = fileName;
    // this.cdr.detectChanges();
  }
}
