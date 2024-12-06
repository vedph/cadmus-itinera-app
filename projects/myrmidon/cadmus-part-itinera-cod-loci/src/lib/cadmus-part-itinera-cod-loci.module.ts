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
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CodLociPartFeatureComponent } from './cod-loci-part-feature/cod-loci-part-feature.component';

import { CodLociPartComponent } from './cod-loci-part/cod-loci-part.component';
import { CodLocusComponent } from './cod-locus/cod-locus.component';
import {
  CodLocationComponent,
  CodLocationPipe,
  CodLocationRangePipe,
} from '@myrmidon/cadmus-cod-location';

@NgModule({
  declarations: [
    CodLociPartComponent,
    CodLocusComponent,
    CodLociPartFeatureComponent,
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
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CodLocationComponent,
    CodLocationPipe,
    CodLocationRangePipe,
    CadmusCodicologyUiModule,
  ],
  exports: [
    CodLociPartComponent,
    CodLocusComponent,
    CodLociPartFeatureComponent,
  ],
})
export class CadmusPartItineraCodLociModule {}
