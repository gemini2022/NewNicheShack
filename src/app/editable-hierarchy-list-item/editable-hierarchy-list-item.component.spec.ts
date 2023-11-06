import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableHierarchyListItemComponent } from './editable-hierarchy-list-item.component';

describe('EditableHierarchyListItemComponent', () => {
  let component: EditableHierarchyListItemComponent;
  let fixture: ComponentFixture<EditableHierarchyListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableHierarchyListItemComponent]
    });
    fixture = TestBed.createComponent(EditableHierarchyListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
