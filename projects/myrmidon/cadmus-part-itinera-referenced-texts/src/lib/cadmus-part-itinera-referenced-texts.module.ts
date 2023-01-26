import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MonacoEditorModule } from 'ngx-monaco-editor';

import { NgToolsModule } from '@myrmidon/ng-tools';
import { CadmusRefsAssertionModule } from '@myrmidon/cadmus-refs-assertion';
import { CadmusRefsAssertedIdsModule } from '@myrmidon/cadmus-refs-asserted-ids';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';

import { ReferencedTextsPartComponent } from './referenced-texts-part/referenced-texts-part.component';
import { ReferencedTextComponent } from './referenced-text/referenced-text.component';
import { ReferencedTextsPartFeatureComponent } from './referenced-texts-part-feature/referenced-texts-part-feature.component';

@NgModule({
  declarations: [
    ReferencedTextsPartComponent,
    ReferencedTextComponent,
    ReferencedTextsPartFeatureComponent,
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
    MatTabsModule,
    MatTooltipModule,
    NgMatToolsModule,
    MonacoEditorModule,
    // Cadmus
    NgToolsModule,
    CadmusRefsAssertedIdsModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusRefsAssertionModule,
  ],
  exports: [
    ReferencedTextsPartComponent,
    ReferencedTextComponent,
    ReferencedTextsPartFeatureComponent,
  ],
})
export class CadmusPartItineraReferencedTextsModule {}
