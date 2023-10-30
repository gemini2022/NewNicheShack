import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableListComponent } from './editable-list.component';

describe('ListComponent', () => {
  let component: EditableListComponent;
  let fixture: ComponentFixture<EditableListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableListComponent]
    });
    fixture = TestBed.createComponent(EditableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
