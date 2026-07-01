import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewExample } from './concept-view-example';

describe('ConceptViewExample', () => {
  let component: ConceptViewExample;
  let fixture: ComponentFixture<ConceptViewExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewExample],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewExample);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
