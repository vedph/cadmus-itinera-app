import { Injectable } from '@angular/core';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartServiceBase } from '@myrmidon/cadmus-state';
import { EditLiteraryWorkInfoPartStore } from './edit-literary-work-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditLiteraryWorkInfoPartService extends EditPartServiceBase {
  constructor(
    editPartStore: EditLiteraryWorkInfoPartStore,
    itemService: ItemService,
    thesaurusService: ThesaurusService
  ) {
    super(itemService, thesaurusService);
    this.store = editPartStore;
  }
}
