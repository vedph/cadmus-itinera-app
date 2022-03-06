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

import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import { CadmusRefsAssertionModule } from '@myrmidon/cadmus-refs-assertion';

import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { PersonWorksPartComponent } from './person-works-part/person-works-part.component';
import { PersonWorkComponent } from './person-work/person-work.component';

@NgModule({
  declarations: [PersonWorksPartComponent, PersonWorkComponent],
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
    // bricks
    CadmusRefsAssertionModule,
    // Cadmus
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
  ],
  exports: [PersonWorksPartComponent, PersonWorkComponent],
})
export class CadmusPartItineraPersonWorksModule {}
