import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDomain } from './select-domain';

describe('SelectDomain', () => {
  let component: SelectDomain;
  let fixture: ComponentFixture<SelectDomain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectDomain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectDomain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
