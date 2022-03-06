import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditPersonWorksPartStore } from './edit-person-works-part.store';

@Injectable({ providedIn: 'root' })
export class EditPersonWorksPartQuery extends EditPartQueryBase {
  constructor(store: EditPersonWorksPartStore) {
    super(store);
  }
}
