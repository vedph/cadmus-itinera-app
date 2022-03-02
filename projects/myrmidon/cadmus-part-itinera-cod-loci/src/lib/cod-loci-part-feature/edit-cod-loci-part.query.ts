import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditCodLociPartStore } from './edit-cod-loci-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodLociPartQuery extends EditPartQueryBase {
  constructor(store: EditCodLociPartStore) {
    super(store);
  }
}
