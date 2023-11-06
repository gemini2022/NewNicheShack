import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyArrowComponent } from './hierarchy-arrow.component';

describe('HierarchyArrowComponent', () => {
  let component: HierarchyArrowComponent;
  let fixture: ComponentFixture<HierarchyArrowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HierarchyArrowComponent]
    });
    fixture = TestBed.createComponent(HierarchyArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
