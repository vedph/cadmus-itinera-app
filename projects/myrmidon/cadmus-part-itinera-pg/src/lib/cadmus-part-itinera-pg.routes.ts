import { Routes } from '@angular/router';

// cadmus
import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import {
  COD_LOCI_PART_TYPEID,
  CodLociPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-cod-loci';
import {
  COD_POEM_RANGES_PART_TYPEID,
  CodPoemRangesPartFeatureComponent,
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
import {
  WitnessesPartFeatureComponent,
  WITNESSES_PART_TYPEID,
} from '@myrmidon/cadmus-part-itinera-witnesses';

export const CADMUS_PART_ITINERA_PG_ROUTES: Routes = [
  {
    path: `${COD_LOCI_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodLociPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${COD_POEM_RANGES_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodPoemRangesPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${PERSON_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PersonInfoPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${PERSON_WORKS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PersonWorksPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${LETTER_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: LetterInfoPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${LITERARY_WORK_INFO_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: LiteraryWorkInfoPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${REFERENCED_TEXTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: ReferencedTextsPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${RELATED_PERSONS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: RelatedPersonsPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: `${WITNESSES_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: WitnessesPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
];
