import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guidrent } from './guidrent';

describe('Guidrent', () => {
  let component: Guidrent;
  let fixture: ComponentFixture<Guidrent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guidrent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guidrent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
