import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditCodPoemRangesPartStore } from './edit-cod-poem-ranges-part.store';

@Injectable({ providedIn: 'root' })
export class EditCodPoemRangesPartQuery extends EditPartQueryBase {
  constructor(store: EditCodPoemRangesPartStore) {
    super(store);
  }
}
