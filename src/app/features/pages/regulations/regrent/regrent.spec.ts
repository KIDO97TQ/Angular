import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Regrent } from './regrent';

describe('Regrent', () => {
  let component: Regrent;
  let fixture: ComponentFixture<Regrent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Regrent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Regrent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
