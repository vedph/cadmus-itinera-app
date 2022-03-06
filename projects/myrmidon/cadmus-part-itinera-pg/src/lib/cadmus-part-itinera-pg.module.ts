import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// cadmus
import { CadmusCoreModule, PendingChangesGuard } from '@myrmidon/cadmus-core';
import {
  COD_LOCI_PART_TYPEID,
  CodLociPartFeatureComponent,
  CadmusPartItineraCodLociModule,
} from '@myrmidon/cadmus-part-itinera-cod-loci';
import {
  COD_POEM_RANGES_PART_TYPEID,
  CodPoemRangesPartFeatureComponent,
  CadmusPartItineraCodPoemRangesModule,
} from '@myrmidon/cadmus-part-itinera-cod-poem-ranges';
import {
  PersonInfoPartFeatureComponent,
  PERSON_INFO_PART_TYPEID,
} from '@myrmidon/cadmus-part-itinera-person-info';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${COD_LOCI_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodLociPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_POEM_RANGES_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodPoemRangesPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${PERSON_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PersonInfoPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cadmus
    RouterModuleForChild,
    CadmusCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    // Itinera
    CadmusPartItineraCodLociModule,
    CadmusPartItineraCodPoemRangesModule,
  ],
  exports: [],
})
export class CadmusPartItineraPgModule {}
