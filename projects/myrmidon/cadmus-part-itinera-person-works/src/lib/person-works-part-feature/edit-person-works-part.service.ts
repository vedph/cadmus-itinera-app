import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditPersonWorksPartStore } from './edit-person-works-part.store';

@Injectable({ providedIn: 'root' })
export class EditPersonWorksPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditPersonWorksPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
