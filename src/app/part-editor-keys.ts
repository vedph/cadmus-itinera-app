import {
  CATEGORIES_PART_TYPEID,
  DOC_REFERENCES_PART_TYPEID,
  HISTORICAL_DATE_PART_TYPEID,
  KEYWORDS_PART_TYPEID,
  INDEX_KEYWORDS_PART_TYPEID,
  NOTE_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';
import { PartEditorKeys } from '@myrmidon/cadmus-core';
import { EXT_BIBLIOGRAPHY_PART_TYPEID } from '@myrmidon/cadmus-part-biblio-ui';
import { COD_BINDINGS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-bindings';
import { COD_CONTENTS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-contents';
import { COD_DECORATIONS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-decorations';
import { COD_EDITS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-edits';
import { COD_HANDS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-hands';
import { COD_LAYOUTS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-layouts';
import { COD_MATERIAL_DSC_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-material-dsc';
import { COD_SHEET_LABELS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-sheet-labels';
import { COD_SHELFMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-shelfmarks';
import { COD_WATERMARKS_PART_TYPEID } from '@myrmidon/cadmus-part-codicology-watermarks';

// Itinera
import { COD_LOCI_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-cod-loci/src/public-api';
import { COD_POEM_RANGES_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-cod-poem-ranges/src/public-api';
import { PERSON_INFO_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-person-info/src/public-api';
import { PERSON_WORKS_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-person-works/src/public-api';
import { LETTER_INFO_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-letter-info/src/public-api';
import { LITERARY_WORK_INFO_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-literary-work-info/src/public-api';
import { REFERENCED_TEXTS_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-referenced-texts/src/public-api';
import { RELATED_PERSONS_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-related-persons/src/public-api';
import { WITNESSES_PART_TYPEID } from 'projects/myrmidon/cadmus-part-itinera-witnesses/src/public-api';

const GENERAL = 'general';
const BIBLIO = 'biblio';
const CODICOLOGY = 'codicology';
const ITINERA = 'itinera';

/**
 * The parts and fragments editor keys for this UI.
 * Each property is a part type ID, mapped to a value of type PartGroupKey,
 * having a part property with the part's editor key, and a fragments property
 * with the mappings between fragment type IDs and their editor keys.
 */
export const PART_EDITOR_KEYS: PartEditorKeys = {
  // biblio
  [EXT_BIBLIOGRAPHY_PART_TYPEID]: {
    part: BIBLIO,
  },
  // general
  [CATEGORIES_PART_TYPEID]: {
    part: GENERAL,
  },
  [DOC_REFERENCES_PART_TYPEID]: {
    part: GENERAL,
  },
  [HISTORICAL_DATE_PART_TYPEID]: {
    part: GENERAL,
  },
  [INDEX_KEYWORDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [KEYWORDS_PART_TYPEID]: {
    part: GENERAL,
  },
  [NOTE_PART_TYPEID]: {
    part: GENERAL,
  },
  // codicology
  [COD_BINDINGS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_CONTENTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_DECORATIONS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_EDITS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_HANDS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_LAYOUTS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_MATERIAL_DSC_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHEET_LABELS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_SHELFMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  [COD_WATERMARKS_PART_TYPEID]: {
    part: CODICOLOGY,
  },
  // itinera
  [COD_LOCI_PART_TYPEID]: {
    part: ITINERA,
  },
  [COD_POEM_RANGES_PART_TYPEID]: {
    part: ITINERA,
  },
  [PERSON_INFO_PART_TYPEID]: {
    part: ITINERA,
  },
  [PERSON_WORKS_PART_TYPEID]: {
    part: ITINERA,
  },
  [LETTER_INFO_PART_TYPEID]: {
    part: ITINERA,
  },
  [LITERARY_WORK_INFO_PART_TYPEID]: {
    part: ITINERA,
  },
  [REFERENCED_TEXTS_PART_TYPEID]: {
    part: ITINERA
  },
  [RELATED_PERSONS_PART_TYPEID]: {
    part: ITINERA
  },
  [WITNESSES_PART_TYPEID]: {
    part: ITINERA
  }
};
