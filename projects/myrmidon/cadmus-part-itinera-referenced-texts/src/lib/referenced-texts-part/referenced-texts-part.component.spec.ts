import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedTextsPartComponent } from './referenced-texts-part.component';

describe('ReferencedTextsPartComponent', () => {
  let component: ReferencedTextsPartComponent;
  let fixture: ComponentFixture<ReferencedTextsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReferencedTextsPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencedTextsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
