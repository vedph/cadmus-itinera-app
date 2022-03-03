import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// cadmus
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { CodPoemRangesPartComponent } from './cod-poem-ranges-part/cod-poem-ranges-part.component';

@NgModule({
  declarations: [
    CodPoemRangesPartComponent
  ],
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
    NgMatToolsModule,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
    CadmusCodicologyUiModule,
  ],
  exports: [],
})
export class CadmusPartItineraCodPoemRangesModule {}
