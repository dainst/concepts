import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConcept } from './new-concept';

describe('NewConcept', () => {
  let component: NewConcept;
  let fixture: ComponentFixture<NewConcept>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewConcept],
    }).compileComponents();

    fixture = TestBed.createComponent(NewConcept);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
