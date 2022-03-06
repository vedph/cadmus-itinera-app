import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditLetterInfoPartStore } from './edit-letter-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditLetterInfoPartQuery extends EditPartQueryBase {
  constructor(store: EditLetterInfoPartStore) {
    super(store);
  }
}
