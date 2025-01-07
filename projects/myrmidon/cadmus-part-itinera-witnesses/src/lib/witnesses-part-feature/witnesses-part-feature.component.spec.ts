import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WitnessesPartFeatureComponent } from './witnesses-part-feature.component';

describe('WitnessesPartFeatureComponent', () => {
  let component: WitnessesPartFeatureComponent;
  let fixture: ComponentFixture<WitnessesPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WitnessesPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WitnessesPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
