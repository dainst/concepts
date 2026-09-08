import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptHistory } from './concept-history';

describe('ConceptHistory', () => {
  let component: ConceptHistory;
  let fixture: ComponentFixture<ConceptHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
