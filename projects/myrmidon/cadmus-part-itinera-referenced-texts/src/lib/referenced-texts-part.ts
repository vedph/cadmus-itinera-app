import { Part } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

export interface ReferencedText {
  type: string;
  targetId: string;
  targetCitation?: string;
  sourceCitations?: string;
  assertion?: Assertion;
}

/**
 * The ReferencedTexts part model.
 */
export interface ReferencedTextsPart extends Part {
  texts: ReferencedText[];
}

/**
 * The type ID used to identify the ReferencedTextsPart type.
 */
export const REFERENCED_TEXTS_PART_TYPEID = 'it.vedph.itinera.referenced-texts';

/**
 * JSON schema for the ReferencedTexts part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const REFERENCED_TEXTS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/' +
    REFERENCED_TEXTS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'ReferencedTextsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'texts',
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
    texts: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['type', 'targetId'],
            properties: {
              type: {
                type: 'string',
              },
              targetId: {
                type: 'string',
              },
              targetCitation: {
                type: 'string',
              },
              sourceCitations: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                  ],
                },
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
