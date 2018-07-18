import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @Output()
  public onChangeDataset: EventEmitter<String> = new EventEmitter();
  public onChangeSelection: EventEmitter<String> = new EventEmitter();

  public title = 'Visualization of Stream Processed Data';
  public fileName;
  public stationsSelection;

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  private changeFilename(fileName: string) {
    console.log('changeFilename()');
    console.log(fileName);
    this.fileName = fileName;
    // this.cdr.detectChanges();
  }

  private changeSelection(selection: string) {
    console.log('changeSelection()');
    console.log(selection);
    this.stationsSelection = selection;
    // this.cdr.detectChanges();
  }
}
