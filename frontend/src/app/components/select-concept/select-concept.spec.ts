import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectConcept} from './select-concept';

describe('SelectConcept', () => {
  let component: SelectConcept;
  let fixture: ComponentFixture<SelectConcept>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectConcept]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectConcept);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
