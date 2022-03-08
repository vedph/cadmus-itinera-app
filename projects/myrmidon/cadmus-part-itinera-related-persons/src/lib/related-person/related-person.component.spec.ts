import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedPersonComponent } from './related-person.component';

describe('RelatedPersonComponent', () => {
  let component: RelatedPersonComponent;
  let fixture: ComponentFixture<RelatedPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedPersonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
