import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewRaw } from './concept-view-raw';

describe('ConceptViewRaw', () => {
  let component: ConceptViewRaw;
  let fixture: ComponentFixture<ConceptViewRaw>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewRaw],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewRaw);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
