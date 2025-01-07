import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLocusComponent } from './cod-locus.component';

describe('CodLocusComponent', () => {
  let component: CodLocusComponent;
  let fixture: ComponentFixture<CodLocusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodLocusComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLocusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
