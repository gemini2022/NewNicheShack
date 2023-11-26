import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordsHierarchyComponent } from './keywords-hierarchy.component';

describe('KeywordsHierarchyComponent', () => {
  let component: KeywordsHierarchyComponent;
  let fixture: ComponentFixture<KeywordsHierarchyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KeywordsHierarchyComponent]
    });
    fixture = TestBed.createComponent(KeywordsHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
