import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Beranda } from './beranda';

describe('Beranda', () => {
  let component: Beranda;
  let fixture: ComponentFixture<Beranda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Beranda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Beranda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
