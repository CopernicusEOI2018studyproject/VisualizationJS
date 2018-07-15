import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomsnackbarComponent } from './customsnackbar.component';

describe('CustomsnackbarComponent', () => {
  let component: CustomsnackbarComponent;
  let fixture: ComponentFixture<CustomsnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomsnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomsnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
