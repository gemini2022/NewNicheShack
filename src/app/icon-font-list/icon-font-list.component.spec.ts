import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconFontListComponent } from './icon-font-list.component';

describe('IconFontListComponent', () => {
  let component: IconFontListComponent;
  let fixture: ComponentFixture<IconFontListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconFontListComponent]
    });
    fixture = TestBed.createComponent(IconFontListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
