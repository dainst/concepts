import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectConceptComponent} from './select-concept';

describe('SelectConcept', () => {
  let component: SelectConceptComponent;
  let fixture: ComponentFixture<SelectConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectConceptComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectConceptComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
