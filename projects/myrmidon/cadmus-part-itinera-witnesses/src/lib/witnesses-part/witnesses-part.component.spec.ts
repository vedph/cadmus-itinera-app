import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WitnessesPartComponent } from './witnesses-part.component';

describe('WitnessesPartComponent', () => {
  let component: WitnessesPartComponent;
  let fixture: ComponentFixture<WitnessesPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WitnessesPartComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WitnessesPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
