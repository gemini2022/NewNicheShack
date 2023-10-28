import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableListContainerComponent } from './editable-list-container.component';

describe('ListComponent', () => {
  let component: EditableListContainerComponent;
  let fixture: ComponentFixture<EditableListContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditableListContainerComponent]
    });
    fixture = TestBed.createComponent(EditableListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
