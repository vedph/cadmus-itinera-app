import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { WitnessesPartComponent } from './witnesses-part/witnesses-part.component';
import { WitnessComponent } from './witness/witness.component';
import { WitnessesPartFeatureComponent } from './witnesses-part-feature/witnesses-part-feature.component';
import { CodLocationComponent, CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

@NgModule({
  declarations: [
    WitnessesPartComponent,
    WitnessComponent,
    WitnessesPartFeatureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    NgMatToolsModule,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CodLocationRangePipe,
    CodLocationComponent,
  ],
  exports: [
    WitnessesPartComponent,
    WitnessComponent,
    WitnessesPartFeatureComponent,
  ],
})
export class CadmusPartItineraWitnessesModule {}
