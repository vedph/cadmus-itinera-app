import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonInfoPartComponent } from './person-info-part.component';

describe('PersonInfoPartComponent', () => {
  let component: PersonInfoPartComponent;
  let fixture: ComponentFixture<PersonInfoPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonInfoPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonInfoPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
