import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditRelatedPersonsPartStore } from './edit-related-persons-part.store';

@Injectable({ providedIn: 'root' })
export class EditRelatedPersonsPartQuery extends EditPartQueryBase {
  constructor(store: EditRelatedPersonsPartStore) {
    super(store);
  }
}
