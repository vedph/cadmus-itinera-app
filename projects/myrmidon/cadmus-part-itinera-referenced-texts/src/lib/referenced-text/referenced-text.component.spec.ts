import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedTextComponent } from './referenced-text.component';

describe('ReferencedTextComponent', () => {
  let component: ReferencedTextComponent;
  let fixture: ComponentFixture<ReferencedTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferencedTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
