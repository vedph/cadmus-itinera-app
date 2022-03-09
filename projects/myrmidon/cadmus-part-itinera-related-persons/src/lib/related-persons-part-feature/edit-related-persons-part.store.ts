import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

import { EditPartState, EditPartStoreApi } from '@myrmidon/cadmus-state';

import { RELATED_PERSONS_PART_TYPEID } from '../related-persons-part';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: RELATED_PERSONS_PART_TYPEID })
export class EditRelatedPersonsPartStore
  extends Store<EditPartState>
  implements EditPartStoreApi
{
  constructor() {
    super({});
  }

  public setDirty(value: boolean): void {
    this.update({ dirty: value });
  }
  public setSaving(value: boolean): void {
    this.update({ saving: value });
  }
}
