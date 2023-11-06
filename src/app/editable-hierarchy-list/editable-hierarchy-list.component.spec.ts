import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableHierarchyListComponent } from './editable-hierarchy-list.component';

describe('EditableHierarchyListComponent', () => {
  let component: EditableHierarchyListComponent;
  let fixture: ComponentFixture<EditableHierarchyListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableHierarchyListComponent]
    });
    fixture = TestBed.createComponent(EditableHierarchyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
