import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodPoemRangesLayoutComponent } from './cod-poem-ranges-layout.component';

describe('CodPoemRangesLayoutComponent', () => {
  let component: CodPoemRangesLayoutComponent;
  let fixture: ComponentFixture<CodPoemRangesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodPoemRangesLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPoemRangesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
