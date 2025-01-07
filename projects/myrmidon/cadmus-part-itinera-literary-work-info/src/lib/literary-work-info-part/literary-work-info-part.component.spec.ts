import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteraryWorkInfoPartComponent } from './literary-work-info-part.component';

describe('LiteraryWorkInfoPartComponent', () => {
  let component: LiteraryWorkInfoPartComponent;
  let fixture: ComponentFixture<LiteraryWorkInfoPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LiteraryWorkInfoPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiteraryWorkInfoPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
