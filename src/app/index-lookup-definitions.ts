import { IndexLookupDefinitions } from '@myrmidon/cadmus-core';
import {
  METADATA_PART_TYPEID,
  HISTORICAL_EVENTS_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';
import { COD_MATERIAL_DSC_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-material-dsc';
import { COD_HANDS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-hands';
import { COD_DECORATIONS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-decorations';
import { COD_CONTENTS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-contents';
import { COD_EDITS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-edits';
import { LITERARY_WORK_INFO_PART_TYPEID } from '@myrmidon/cadmus-part-itinera-literary-work-info';
import { PERSON_WORKS_PART_TYPEID } from '@myrmidon/cadmus-part-itinera-person-works';
import { REFERENCED_TEXTS_PART_TYPEID } from '@myrmidon/cadmus-part-itinera-referenced-texts';
import { WITNESSES_PART_TYPEID } from '@myrmidon/cadmus-part-itinera-witnesses';

export const INDEX_LOOKUP_DEFINITIONS: IndexLookupDefinitions = {
  // item's metadata
  meta_eid: {
    typeId: METADATA_PART_TYPEID,
    name: 'eid',
  },
  // general parts
  event_eid: {
    typeId: HISTORICAL_EVENTS_PART_TYPEID,
    name: 'eid',
  },
  // codicology parts
  cod_matdsc_eid: {
    typeId: COD_MATERIAL_DSC_PART_TYPEID,
    name: 'unit-eid',
  },
  cod_hand_eid: {
    typeId: COD_HANDS_PART_TYPEID,
    name: 'eid',
  },
  cod_decoration_eid: {
    typeId: COD_DECORATIONS_PART_TYPEID,
    name: 'eid',
  },
  cod_artist_eid: {
    typeId: COD_DECORATIONS_PART_TYPEID,
    name: 'artist-id',
  },
  cod_content_eid: {
    typeId: COD_CONTENTS_PART_TYPEID,
    name: 'eid',
  },
  cod_edit_eid: {
    typeId: COD_EDITS_PART_TYPEID,
    name: 'eid',
  },
  // itinera parts
  lit_author_eid: {
    typeId: LITERARY_WORK_INFO_PART_TYPEID,
    name: 'author',
  },
  person_work_eid: {
    typeId: PERSON_WORKS_PART_TYPEID,
    name: 'eid',
  },
  ref_text_eid: {
    typeId: REFERENCED_TEXTS_PART_TYPEID,
    name: 'target-id',
  },
  witness_eid: {
    typeId: WITNESSES_PART_TYPEID,
    name: 'id',
  },
};
