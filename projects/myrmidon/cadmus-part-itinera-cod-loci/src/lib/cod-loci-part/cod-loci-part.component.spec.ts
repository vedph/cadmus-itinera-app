import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLociPartComponent } from './cod-loci-part.component';

describe('CodLociPartComponent', () => {
  let component: CodLociPartComponent;
  let fixture: ComponentFixture<CodLociPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLociPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLociPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
