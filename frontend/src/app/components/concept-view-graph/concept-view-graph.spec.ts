import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewGraph } from './concept-view-graph';

describe('ConceptViewGraph', () => {
  let component: ConceptViewGraph;
  let fixture: ComponentFixture<ConceptViewGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewGraph],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
