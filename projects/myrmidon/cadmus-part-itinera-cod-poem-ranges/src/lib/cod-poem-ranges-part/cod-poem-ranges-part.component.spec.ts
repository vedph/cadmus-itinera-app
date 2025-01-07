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

import { CodPoemRangesPartComponent } from './cod-poem-ranges-part.component';

describe('CodPoemRangesPartComponent', () => {
  let component: CodPoemRangesPartComponent;
  let fixture: ComponentFixture<CodPoemRangesPartComponent>;

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
        CodPoemRangesPartComponent,
    ],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodPoemRangesPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
