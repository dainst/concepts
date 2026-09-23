import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditGeographicalExtend} from './edit-geographical-extend.component';

describe('EditGeographicExtend', () => {
  let component: EditGeographicalExtend;
  let fixture: ComponentFixture<EditGeographicalExtend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditGeographicalExtend]
    }).compileComponents();

    fixture = TestBed.createComponent(EditGeographicalExtend);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
