import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@NgModule({
  declarations: [],
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
    MatTabsModule,
    MatTooltipModule,
    NgMatToolsModule,
    MonacoEditorModule,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusCodLocationModule,
  ],
  exports: [],
})
export class CadmusPartItineraWitnessesModule {}
