import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodLociPartFeatureComponent } from './cod-loci-part-feature.component';

describe('CodLociPartFeatureComponent', () => {
  let component: CodLociPartFeatureComponent;
  let fixture: ComponentFixture<CodLociPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodLociPartFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodLociPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
