import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonWorkComponent } from './person-work.component';

describe('PersonWorkComponent', () => {
  let component: PersonWorkComponent;
  let fixture: ComponentFixture<PersonWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonWorkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
