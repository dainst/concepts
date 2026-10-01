import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewTree } from './concept-view-tree';

describe('ConceptViewTree', () => {
  let component: ConceptViewTree;
  let fixture: ComponentFixture<ConceptViewTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptViewTree);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
