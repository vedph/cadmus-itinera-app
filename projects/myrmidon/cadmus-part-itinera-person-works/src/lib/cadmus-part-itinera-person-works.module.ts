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

import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { PersonWorksPartComponent } from './person-works-part/person-works-part.component';
import { PersonWorkComponent } from './person-work/person-work.component';
import { PersonWorksPartFeatureComponent } from './person-works-part-feature/person-works-part-feature.component';
import { FlagsPickerComponent } from '@myrmidon/cadmus-ui-flags-picker';
import { AssertionComponent } from '@myrmidon/cadmus-refs-assertion';

@NgModule({
  declarations: [
    PersonWorksPartComponent,
    PersonWorkComponent,
    PersonWorksPartFeatureComponent,
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
    // bricks
    FlagsPickerComponent,
    AssertionComponent,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [
    PersonWorksPartComponent,
    PersonWorkComponent,
    PersonWorksPartFeatureComponent,
  ],
})
export class CadmusPartItineraPersonWorksModule {}
