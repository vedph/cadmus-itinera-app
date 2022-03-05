import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

import { EditPartState, EditPartStoreApi } from '@myrmidon/cadmus-state';

import { COD_POEM_RANGES_PART_TYPEID } from '../cod-poem-ranges-part';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: COD_POEM_RANGES_PART_TYPEID })
export class EditCodPoemRangesPartStore
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
