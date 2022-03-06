import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonWorksPartComponent } from './person-works-part.component';

describe('PersonWorksPartComponent', () => {
  let component: PersonWorksPartComponent;
  let fixture: ComponentFixture<PersonWorksPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonWorksPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonWorksPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
