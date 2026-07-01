import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptAbstract } from './concept-abstract';

describe('ConceptAbstract', () => {
  let component: ConceptAbstract;
  let fixture: ComponentFixture<ConceptAbstract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptAbstract],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptAbstract);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
