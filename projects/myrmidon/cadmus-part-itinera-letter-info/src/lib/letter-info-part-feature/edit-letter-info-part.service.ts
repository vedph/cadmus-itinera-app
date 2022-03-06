import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditLetterInfoPartStore } from './edit-letter-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditLetterInfoPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditLetterInfoPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
