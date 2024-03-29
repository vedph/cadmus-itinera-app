import { Part } from '@myrmidon/cadmus-core';
import { AlnumRange } from './services/alnum-range.service';

/**
 * A colometric layout assigned to a range of poems.
 */
export interface CodPoemLayout {
  range: AlnumRange;
  layout: string;
  note?: string;
}

/**
 * The CodPoemRanges part model.
 */
export interface CodPoemRangesPart extends Part {
  sortType: string;
  ranges?: AlnumRange[];
  layouts?: CodPoemLayout[];
  tag?: string;
  note?: string;
}

/**
 * The type ID used to identify the CodPoemRangesPart type.
 */
export const COD_POEM_RANGES_PART_TYPEID = 'it.vedph.itinera.cod-poem-ranges';

/**
 * JSON schema for the CodPoemRanges part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_POEM_RANGES_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/' +
    COD_POEM_RANGES_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'CodPoemRangesPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'sortType',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    sortType: {
      type: 'string',
    },
    ranges: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['a'],
            properties: {
              a: {
                type: 'string',
              },
              b: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    layouts: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['range', 'layout'],
            properties: {
              range: {
                type: 'object',
                required: ['a'],
                properties: {
                  a: {
                    type: 'string',
                  },
                  b: {
                    type: 'string',
                  },
                },
              },
              layout: {
                type: 'string',
              },
              note: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
    tag: {
      type: 'string'
    },
    note: {
      type: 'string',
    },
  },
};
