import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditReferencedTextsPartStore } from './edit-referenced-texts-part.store';

@Injectable({ providedIn: 'root' })
export class EditReferencedTextsPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditReferencedTextsPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
