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
  LetterInfoPartFeatureComponent,
  LETTER_INFO_PART_TYPEID,
} from '@myrmidon/cadmus-part-itinera-letter-info';
import {
  PersonInfoPartFeatureComponent,
  PERSON_INFO_PART_TYPEID,
} from '@myrmidon/cadmus-part-itinera-person-info';
import {
  PERSON_WORKS_PART_TYPEID,
  PersonWorksPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-person-works';
import {
  LITERARY_WORK_INFO_PART_TYPEID,
  LiteraryWorkInfoPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-literary-work-info';
import {
  REFERENCED_TEXTS_PART_TYPEID,
  ReferencedTextsPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-referenced-texts';
import {
  RelatedPersonsPartFeatureComponent,
  RELATED_PERSONS_PART_TYPEID,
} from '@myrmidon/cadmus-part-itinera-related-persons';
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
  {
    path: `${PERSON_WORKS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PersonWorksPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${LETTER_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: LetterInfoPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${LITERARY_WORK_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: LiteraryWorkInfoPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${REFERENCED_TEXTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: ReferencedTextsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${RELATED_PERSONS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: RelatedPersonsPartFeatureComponent,
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
