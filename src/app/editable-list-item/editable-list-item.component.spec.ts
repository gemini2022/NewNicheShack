import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableListItemComponent } from './editable-list-item.component';

describe('ListItemComponent', () => {
  let component: EditableListItemComponent;
  let fixture: ComponentFixture<EditableListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableListItemComponent]
    });
    fixture = TestBed.createComponent(EditableListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
