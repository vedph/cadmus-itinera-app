import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedPersonsPartComponent } from './related-persons-part.component';

describe('RelatedPersonsPartComponent', () => {
  let component: RelatedPersonsPartComponent;
  let fixture: ComponentFixture<RelatedPersonsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedPersonsPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedPersonsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
