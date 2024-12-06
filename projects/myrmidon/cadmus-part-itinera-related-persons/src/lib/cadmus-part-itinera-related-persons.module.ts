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

import { NgeMonacoModule } from '@cisstech/nge/monaco';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';

import { AssertionComponent } from '@myrmidon/cadmus-refs-assertion';
import { AssertedCompositeIdsComponent, AssertedIdsComponent } from '@myrmidon/cadmus-refs-asserted-ids';

import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { RelatedPersonComponent } from './related-person/related-person.component';
import { RelatedPersonsPartComponent } from './related-persons-part/related-persons-part.component';
import { RelatedPersonsPartFeatureComponent } from './related-persons-part-feature/related-persons-part-feature.component';

@NgModule({
  declarations: [
    RelatedPersonComponent,
    RelatedPersonsPartComponent,
    RelatedPersonsPartFeatureComponent,
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
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    AssertedCompositeIdsComponent,
    AssertedIdsComponent,
    AssertionComponent,
  ],
  exports: [
    RelatedPersonComponent,
    RelatedPersonsPartComponent,
    RelatedPersonsPartFeatureComponent,
  ],
})
export class CadmusPartItineraRelatedPersonsModule {}
