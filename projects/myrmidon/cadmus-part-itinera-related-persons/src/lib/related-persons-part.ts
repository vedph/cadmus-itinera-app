import { Part } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

export interface RelatedPerson {
  type: string;
  name: string;
  targetId: string;
  assertion?: Assertion;
}

/**
 * The RelatedPersons part model.
 */
export interface RelatedPersonsPart extends Part {
  persons: RelatedPerson[];
}

/**
 * The type ID used to identify the RelatedPersonsPart type.
 */
export const RELATED_PERSONS_PART_TYPEID = 'it.vedph.itinera.related-persons';

/**
 * JSON schema for the RelatedPersons part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const RELATED_PERSONS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/' +
    RELATED_PERSONS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'RelatedPersonsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'persons',
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
    persons: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['type', 'name', 'targetId'],
            properties: {
              type: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              targetId: {
                type: 'string',
              },
              assertion: {
                type: 'object',
              },
            },
          },
        ],
      },
    },
  },
};
