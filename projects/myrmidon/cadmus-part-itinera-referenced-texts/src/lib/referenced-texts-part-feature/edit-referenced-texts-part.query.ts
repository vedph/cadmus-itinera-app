import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditReferencedTextsPartStore } from './edit-referenced-texts-part.store';

@Injectable({ providedIn: 'root' })
export class EditReferencedTextsPartQuery extends EditPartQueryBase {
  constructor(store: EditReferencedTextsPartStore) {
    super(store);
  }
}
