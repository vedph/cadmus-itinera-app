import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterInfoPartComponent } from './letter-info-part.component';

describe('LetterInfoPartComponent', () => {
  let component: LetterInfoPartComponent;
  let fixture: ComponentFixture<LetterInfoPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LetterInfoPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterInfoPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
