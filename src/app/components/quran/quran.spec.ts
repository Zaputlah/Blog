import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quran } from './quran';

describe('Quran', () => {
  let component: Quran;
  let fixture: ComponentFixture<Quran>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quran]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quran);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
