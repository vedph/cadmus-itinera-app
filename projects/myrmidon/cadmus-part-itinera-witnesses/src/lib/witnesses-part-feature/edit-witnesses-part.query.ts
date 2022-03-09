import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';

import { EditWitnessesPartStore } from './edit-witnesses-part.store';

@Injectable({ providedIn: 'root' })
export class EditWitnessesPartQuery extends EditPartQueryBase {
  constructor(store: EditWitnessesPartStore) {
    super(store);
  }
}
