import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHeader } from './system-header.component';

describe('Menu', () => {
  let component: SystemHeader;
  let fixture: ComponentFixture<SystemHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
