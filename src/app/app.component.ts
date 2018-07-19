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

  public title = 'FloodOrNot';
  public fileName;
  public stationsSelection;

  private highlight;

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  private changeFilename(fileName: string) {
    this.fileName = fileName;
    // this.cdr.detectChanges();
  }

  private changeSelection(selection: string) {
    this.stationsSelection = selection;
    // this.cdr.detectChanges();
  }

  private changeHighlighting(highlight: number) {
    this.highlight = highlight;
  }
}
