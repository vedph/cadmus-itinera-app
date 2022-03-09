import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';

import { EditWitnessesPartStore } from './edit-witnesses-part.store';

@Injectable({ providedIn: 'root' })
export class EditWitnessesPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditWitnessesPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
