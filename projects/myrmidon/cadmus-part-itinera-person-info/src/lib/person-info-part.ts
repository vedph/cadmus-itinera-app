import { Part } from '@myrmidon/cadmus-core';

/**
 * The PersonInfo part model.
 */
export interface PersonInfoPart extends Part {
  sex: string;
  bio?: string;
}

/**
 * The type ID used to identify the PersonInfoPart type.
 */
export const PERSON_INFO_PART_TYPEID = 'it.vedph.itinera.person-info';

/**
 * JSON schema for the PersonInfo part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const PERSON_INFO_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'www.vedph.it/cadmus/parts/itinera/' + PERSON_INFO_PART_TYPEID + '.json',
  type: 'object',
  title: 'PersonInfoPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'sex'
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
    sex: {
      type: 'string'
    },
    bio: {
      type: 'string'
    },
  },
};
