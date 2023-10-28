import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrumpyListComponent } from './trumpy-list.component';

describe('TrumpyListComponent', () => {
  let component: TrumpyListComponent;
  let fixture: ComponentFixture<TrumpyListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TrumpyListComponent]
    });
    fixture = TestBed.createComponent(TrumpyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
