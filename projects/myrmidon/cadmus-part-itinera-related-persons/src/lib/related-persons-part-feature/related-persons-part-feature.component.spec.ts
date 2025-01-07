import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedPersonsPartFeatureComponent } from './related-persons-part-feature.component';

describe('RelatedPersonsPartFeatureComponent', () => {
  let component: RelatedPersonsPartFeatureComponent;
  let fixture: ComponentFixture<RelatedPersonsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RelatedPersonsPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedPersonsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
