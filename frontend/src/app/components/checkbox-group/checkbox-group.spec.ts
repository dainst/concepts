import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroup } from './checkbox-group';

describe('CheckboxGroup', () => {
  let component: CheckboxGroup;
  let fixture: ComponentFixture<CheckboxGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
