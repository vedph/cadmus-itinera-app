import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteraryWorkInfoPartFeatureComponent } from './literary-work-info-part-feature.component';

describe('LiteraryWorkInfoPartFeatureComponent', () => {
  let component: LiteraryWorkInfoPartFeatureComponent;
  let fixture: ComponentFixture<LiteraryWorkInfoPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LiteraryWorkInfoPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiteraryWorkInfoPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
