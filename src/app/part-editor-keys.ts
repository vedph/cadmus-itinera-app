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

const GENERAL = 'general';
const BIBLIO = 'biblio';
// const PHILOLOGY = 'philology';

/**
 * The parts and fragments editor keys for this UI.
 * Each property is a part type ID, mapped to a value of type PartGroupKey,
 * having a part property with the part's editor key, and a fragments property
 * with the mappings between fragment type IDs and their editor keys.
 */
export const PART_EDITOR_KEYS: PartEditorKeys = {
  [EXT_BIBLIOGRAPHY_PART_TYPEID]: {
    part: BIBLIO,
  },
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
  // itinera parts
};
