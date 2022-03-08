import { Injectable } from '@angular/core';
import { EditPartQueryBase } from '@myrmidon/cadmus-state';
import { EditLiteraryWorkInfoPartStore } from './edit-literary-work-info-part.store';

@Injectable({ providedIn: 'root' })
export class EditLiteraryWorkInfoPartQuery extends EditPartQueryBase {
  constructor(store: EditLiteraryWorkInfoPartStore) {
    super(store);
  }
}
