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

import { NgeMonacoModule } from '@cisstech/nge/monaco';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { ReferencedTextsPartComponent } from './referenced-texts-part/referenced-texts-part.component';
import { ReferencedTextComponent } from './referenced-text/referenced-text.component';
import { ReferencedTextsPartFeatureComponent } from './referenced-texts-part-feature/referenced-texts-part-feature.component';
import { AssertedCompositeIdComponent, AssertedIdsComponent } from '@myrmidon/cadmus-refs-asserted-ids';
import { AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

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
    NgeMonacoModule,
    FlatLookupPipe,
    // Cadmus
    AssertedCompositeIdComponent,
    AssertedIdsComponent,
    AssertionComponent,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [
    ReferencedTextsPartComponent,
    ReferencedTextComponent,
    ReferencedTextsPartFeatureComponent,
  ],
})
export class CadmusPartItineraReferencedTextsModule {}
