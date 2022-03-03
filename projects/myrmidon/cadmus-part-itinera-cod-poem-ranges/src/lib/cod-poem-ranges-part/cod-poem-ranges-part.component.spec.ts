import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodPoemRangesPartComponent } from './cod-poem-ranges-part.component';

describe('CodPoemRangesPartComponent', () => {
  let component: CodPoemRangesPartComponent;
  let fixture: ComponentFixture<CodPoemRangesPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodPoemRangesPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPoemRangesPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
