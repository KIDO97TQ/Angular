import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carts } from './carts';

describe('Carts', () => {
  let component: Carts;
  let fixture: ComponentFixture<Carts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
