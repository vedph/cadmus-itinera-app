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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CadmusRefsAssertedIdsModule } from '@myrmidon/cadmus-refs-asserted-ids';
import { CadmusRefsAssertionModule } from '@myrmidon/cadmus-refs-assertion';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiFlagsPickerModule } from '@myrmidon/cadmus-ui-flags-picker';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';

import { AssertedTitleComponent } from './asserted-title/asserted-title.component';
import { LiteraryWorkInfoPartComponent } from './literary-work-info-part/literary-work-info-part.component';
import { LiteraryWorkInfoPartFeatureComponent } from './literary-work-info-part-feature/literary-work-info-part-feature.component';

@NgModule({
  declarations: [
    LiteraryWorkInfoPartComponent,
    AssertedTitleComponent,
    LiteraryWorkInfoPartFeatureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // material
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
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
    CadmusRefsAssertedIdsModule,
    CadmusRefsAssertionModule,
    CadmusUiFlagsPickerModule,
  ],
  exports: [
    LiteraryWorkInfoPartComponent,
    AssertedTitleComponent,
    LiteraryWorkInfoPartFeatureComponent,
  ],
})
export class CadmusPartItineraLiteraryWorkInfoModule {}
