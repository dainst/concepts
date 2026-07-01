import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptComponent } from './concept.component';

describe('Concept', () => {
  let component: ConceptComponent;
  let fixture: ComponentFixture<ConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
