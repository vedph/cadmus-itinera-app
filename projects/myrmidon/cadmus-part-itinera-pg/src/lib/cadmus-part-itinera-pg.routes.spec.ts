import { Type } from '@angular/core';

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
  LETTER_INFO_PART_TYPEID,
  LetterInfoPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-letter-info';
import {
  LITERARY_WORK_INFO_PART_TYPEID,
  LiteraryWorkInfoPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-literary-work-info';
import {
  PERSON_INFO_PART_TYPEID,
  PersonInfoPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-person-info';
import {
  PERSON_WORKS_PART_TYPEID,
  PersonWorksPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-person-works';
import {
  REFERENCED_TEXTS_PART_TYPEID,
  ReferencedTextsPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-referenced-texts';
import {
  RELATED_PERSONS_PART_TYPEID,
  RelatedPersonsPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-related-persons';
import {
  WITNESSES_PART_TYPEID,
  WitnessesPartFeatureComponent,
} from '@myrmidon/cadmus-part-itinera-witnesses';

import { CADMUS_PART_ITINERA_PG_ROUTES } from './cadmus-part-itinera-pg.routes';

/**
 * The editor of each Itinera part type.
 */
const EDITORS: [string, Type<unknown>][] = [
  [COD_LOCI_PART_TYPEID, CodLociPartFeatureComponent],
  [COD_POEM_RANGES_PART_TYPEID, CodPoemRangesPartFeatureComponent],
  [LETTER_INFO_PART_TYPEID, LetterInfoPartFeatureComponent],
  [LITERARY_WORK_INFO_PART_TYPEID, LiteraryWorkInfoPartFeatureComponent],
  [PERSON_INFO_PART_TYPEID, PersonInfoPartFeatureComponent],
  [PERSON_WORKS_PART_TYPEID, PersonWorksPartFeatureComponent],
  [REFERENCED_TEXTS_PART_TYPEID, ReferencedTextsPartFeatureComponent],
  [RELATED_PERSONS_PART_TYPEID, RelatedPersonsPartFeatureComponent],
  [WITNESSES_PART_TYPEID, WitnessesPartFeatureComponent],
];

describe('CADMUS_PART_ITINERA_PG_ROUTES', () => {
  it('should have a route per part type', () => {
    expect(CADMUS_PART_ITINERA_PG_ROUTES).toHaveLength(EDITORS.length);
  });

  it.each(EDITORS)('should route %s to its editor', (typeId, component) => {
    const routes = CADMUS_PART_ITINERA_PG_ROUTES.filter(
      (r) => r.path === `${typeId}/:pid`,
    );

    expect(routes).toHaveLength(1);
    expect(routes[0].component).toBe(component);
  });

  it('should not route different part types to the same editor', () => {
    const components = CADMUS_PART_ITINERA_PG_ROUTES.map((r) => r.component);

    expect(new Set(components).size).toBe(components.length);
  });

  it('should start each path with the part type ID followed by the part ID', () => {
    // the editors get their part type ID from the path up to its first slash
    for (const route of CADMUS_PART_ITINERA_PG_ROUTES) {
      expect(route.path).toMatch(/^it\.vedph\.itinera\.[a-z-]+\/:pid$/);
    }
  });

  it('should match each path in full', () => {
    for (const route of CADMUS_PART_ITINERA_PG_ROUTES) {
      expect(route.pathMatch).toBe('full');
    }
  });

  it('should guard each editor against losing pending changes', () => {
    for (const route of CADMUS_PART_ITINERA_PG_ROUTES) {
      expect(route.canDeactivate).toEqual([pendingChangesGuard]);
    }
  });
});
