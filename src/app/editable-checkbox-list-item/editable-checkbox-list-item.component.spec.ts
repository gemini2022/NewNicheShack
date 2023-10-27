import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableCheckboxListItemComponent } from './editable-checkbox-list-item.component';

describe('EditableCheckboxListItemComponent', () => {
  let component: EditableCheckboxListItemComponent;
  let fixture: ComponentFixture<EditableCheckboxListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableCheckboxListItemComponent]
    });
    fixture = TestBed.createComponent(EditableCheckboxListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
