import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mysetting } from './mysetting';

describe('Mysetting', () => {
  let component: Mysetting;
  let fixture: ComponentFixture<Mysetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mysetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mysetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
