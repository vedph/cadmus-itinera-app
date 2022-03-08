import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

import { EditPartState, EditPartStoreApi } from '@myrmidon/cadmus-state';

import { REFERENCED_TEXTS_PART_TYPEID } from '../referenced-texts-part';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: REFERENCED_TEXTS_PART_TYPEID })
export class EditReferencedTextsPartStore
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
