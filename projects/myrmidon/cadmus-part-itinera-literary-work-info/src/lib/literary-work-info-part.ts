import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

export interface AssertedTitle {
  language: string;
  value: string;
  assertion?: Assertion;
}

/**
 * The LiteraryWorkInfo part model.
 */
export interface LiteraryWorkInfoPart extends Part {
  languages: string[];
  genre: string;
  metres?: string[];
  strophes?: string[];
  isLost?: boolean;
  authorIds?: AssertedCompositeId[];
  titles: AssertedTitle[];
  note?: string;
}

/**
 * The type ID used to identify the LiteraryWorkInfoPart type.
 */
export const LITERARY_WORK_INFO_PART_TYPEID =
  'it.vedph.itinera.literary-work-info';

/**
 * JSON schema for the LiteraryWorkInfo part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const LITERARY_WORK_INFO_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/itinera/' +
    LITERARY_WORK_INFO_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'LiteraryWorkInfoPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'languages',
    'genre',
    'titles',
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
    languages: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
    },
    genre: {
      type: 'string',
    },
    metres: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
    },
    strophes: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string',
          },
        ],
      },
    },
    isLost: {
      type: 'boolean',
    },
    author: {
      type: 'string',
    },
    authorIds: {
      type: 'array',
      items: {
        type: 'object',
        default: {},
        required: ['target'],
        properties: {
          target: {
            type: 'object',
            required: ['gid', 'label'],
            properties: {
              gid: {
                type: 'string',
              },
              label: {
                type: 'string',
              },
              itemId: {
                type: 'string',
              },
              partId: {
                type: 'string',
              },
              partTypeId: {
                type: 'string',
              },
              roleId: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              value: {
                type: 'string',
              },
            },
          },
          scope: {
            type: 'string',
          },
          tag: {
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
    },
    titles: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['language', 'value'],
            properties: {
              language: {
                type: 'string',
              },
              value: {
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
    note: {
      type: 'string',
    },
  },
};
