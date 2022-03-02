import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { Part } from '@myrmidon/cadmus-core';

/**
 * A single locus in CodLociPart.
 */
export interface CodLocus {
  citation: string;
  range: CodLocationRange;
  text: string;
  images?: CodImage[];
}

/**
 * The CodLoci part model.
 */
export interface CodLociPart extends Part {
  loci: CodLocus[];
}

/**
 * The type ID used to identify the CodLociPart type.
 */
export const COD_LOCI_PART_TYPEID = 'it.vedph.itinera.cod-loci';

/**
 * JSON schema for the CodLoci part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const COD_LOCI_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/itinera/' + COD_LOCI_PART_TYPEID + '.json',
  type: 'object',
  title: 'CodLociPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'loci',
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
    loci: {
      type: 'array',
      title: 'The loci schema',
      items: {
        anyOf: [
          {
            type: 'object',
            required: ['citation', 'range', 'text'],
            properties: {
              citation: {
                type: 'string',
              },
              range: {
                type: 'object',
                required: ['start', 'end'],
                properties: {
                  start: {
                    type: 'object',
                    required: ['n'],
                    properties: {
                      endleaf: {
                        type: 'integer',
                      },
                      s: {
                        type: 'string',
                      },
                      n: {
                        type: 'integer',
                      },
                      rmn: {
                        type: 'boolean',
                      },
                      sfx: {
                        type: 'string',
                      },
                      v: {
                        type: 'boolean',
                      },
                      c: {
                        type: 'integer',
                      },
                      l: {
                        type: 'integer',
                      },
                      word: {
                        type: 'string',
                      },
                    },
                  },
                  end: {
                    type: 'object',
                    required: ['n'],
                    properties: {
                      endleaf: {
                        type: 'integer',
                      },
                      s: {
                        type: 'string',
                      },
                      n: {
                        type: 'integer',
                      },
                      rmn: {
                        type: 'boolean',
                      },
                      sfx: {
                        type: 'string',
                      },
                      v: {
                        type: 'boolean',
                      },
                      c: {
                        type: 'integer',
                      },
                      l: {
                        type: 'integer',
                      },
                      word: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
              text: {
                type: 'string',
              },
              images: {
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'object',
                      required: ['id', 'type'],
                      properties: {
                        id: {
                          type: 'string',
                        },
                        type: {
                          type: 'string',
                        },
                        sourceId: {
                          type: 'string',
                        },
                        label: {
                          type: 'string',
                        },
                        copyright: {
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  },
};
