import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { Part } from '@myrmidon/cadmus-core';

export interface Witness {
  id: string;
  ranges: CodLocationRange[];
}

/**
 * The witnesses part model.
 */
export interface WitnessesPart extends Part {
  witnesses: Witness[];
}

/**
 * The type ID used to identify the WitnessesPart type.
 */
export const WITNESSES_PART_TYPEID = 'it.vedph.itinera.witnesses';

/**
 * JSON schema for the Witnesses part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const WITNESSES_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/itinera/' + WITNESSES_PART_TYPEID + '.json',
  type: 'object',
  title: 'WitnessesPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'witnesses',
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
    witnesses: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['id', 'ranges'],
            properties: {
              id: {
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
            },
            additionalProperties: true,
          },
        ],
      },
    },
  },
};
