import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditCodPoemRangesPartStore } from './edit-cod-poem-ranges-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodPoemRangesPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodPoemRangesPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
