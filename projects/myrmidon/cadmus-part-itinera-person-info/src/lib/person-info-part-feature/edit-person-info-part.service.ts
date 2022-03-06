import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditPersonInfoPartStore } from './edit-person-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditPersonInfoPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditPersonInfoPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
