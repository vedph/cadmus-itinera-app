import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';
import { EditCodLociPartStore } from './edit-cod-loci-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodLociPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditCodLociPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
