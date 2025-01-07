import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CodPoemRangeLayoutsComponent } from './cod-poem-range-layouts.component';

describe('CodPoemRangeLayoutsComponent', () => {
  let component: CodPoemRangeLayoutsComponent;
  let fixture: ComponentFixture<CodPoemRangeLayoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // material
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTabsModule,
        MatTooltipModule,
        CodPoemRangeLayoutsComponent,
    ],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPoemRangeLayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
