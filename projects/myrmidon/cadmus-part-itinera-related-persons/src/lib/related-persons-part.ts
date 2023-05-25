import { Part } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

export interface RelatedPerson {
  type: string;
  name: string;
  ids?: AssertedCompositeId[];
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
              ids: {
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
            },
          },
        ],
      },
    },
  },
};
