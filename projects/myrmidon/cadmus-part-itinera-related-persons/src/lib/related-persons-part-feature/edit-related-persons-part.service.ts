import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditRelatedPersonsPartStore } from './edit-related-persons-part.store';

@Injectable({ providedIn: 'root' })
export class EditRelatedPersonsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditRelatedPersonsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
