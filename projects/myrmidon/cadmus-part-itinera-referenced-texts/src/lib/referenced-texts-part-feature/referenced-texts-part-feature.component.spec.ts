import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedTextsPartFeatureComponent } from './referenced-texts-part-feature.component';

describe('ReferencedTextsPartFeatureComponent', () => {
  let component: ReferencedTextsPartFeatureComponent;
  let fixture: ComponentFixture<ReferencedTextsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReferencedTextsPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencedTextsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
