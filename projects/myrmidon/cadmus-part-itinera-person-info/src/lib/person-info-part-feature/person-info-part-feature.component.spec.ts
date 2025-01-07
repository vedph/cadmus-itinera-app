import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonInfoPartFeatureComponent } from './person-info-part-feature.component';

describe('PersonInfoPartFeatureComponent', () => {
  let component: PersonInfoPartFeatureComponent;
  let fixture: ComponentFixture<PersonInfoPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PersonInfoPartFeatureComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonInfoPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
