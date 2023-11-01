import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconFontListItemComponent } from './icon-font-list-item.component';

describe('IconFontListItemComponent', () => {
  let component: IconFontListItemComponent;
  let fixture: ComponentFixture<IconFontListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconFontListItemComponent]
    });
    fixture = TestBed.createComponent(IconFontListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
