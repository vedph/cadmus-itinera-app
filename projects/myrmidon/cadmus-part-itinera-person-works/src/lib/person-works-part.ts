import { Part } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

/**
 * A work assigned to a person.
 */
export interface PersonWork {
  eid?: string;
  title: string;
  assertion?: Assertion;
}

/**
 * The PersonWorks part model.
 */
export interface PersonWorksPart extends Part {
  works: PersonWork[];
}

/**
 * The type ID used to identify the PersonWorksPart type.
 */
export const PERSON_WORKS_PART_TYPEID = 'it.vedph.itinera.person-works';

/**
 * JSON schema for the PersonWorks part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const PERSON_WORKS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/' + PERSON_WORKS_PART_TYPEID + '.json',
  type: 'object',
  title: 'PersonWorksPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'works',
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
    works: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['title'],
            properties: {
              eid: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              assertion: {
                type: 'object',
                required: ['rank'],
                properties: {
                  tag: {
                    type: 'string',
                  },
                  rank: {
                    type: 'integer',
                  },
                  note: {
                    type: 'string',
                  },
                  references: {
                    type: 'array',
                    items: {
                      anyOf: [
                        {
                          type: 'object',
                          required: ['citation'],
                          properties: {
                            type: {
                              type: 'string',
                            },
                            tag: {
                              type: 'string',
                            },
                            citation: {
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
                },
              },
            },
          },
        ],
      },
    },
  },
};
