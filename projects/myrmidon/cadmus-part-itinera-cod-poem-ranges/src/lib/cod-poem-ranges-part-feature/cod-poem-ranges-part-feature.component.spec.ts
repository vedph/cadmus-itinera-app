import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodPoemRangesPartFeatureComponent } from './cod-poem-ranges-part-feature.component';

describe('CodPoemRangesPartFeatureComponent', () => {
  let component: CodPoemRangesPartFeatureComponent;
  let fixture: ComponentFixture<CodPoemRangesPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CodPoemRangesPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPoemRangesPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
