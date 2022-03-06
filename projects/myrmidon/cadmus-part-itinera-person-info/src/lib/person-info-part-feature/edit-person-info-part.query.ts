import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditPersonInfoPartStore } from './edit-person-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditPersonInfoPartQuery extends EditPartQueryBase {
  constructor(store: EditPersonInfoPartStore) {
    super(store);
  }
}
