import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssertedTitleComponent } from './asserted-title.component';

describe('AssertedTitleComponent', () => {
  let component: AssertedTitleComponent;
  let fixture: ComponentFixture<AssertedTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AssertedTitleComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssertedTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
