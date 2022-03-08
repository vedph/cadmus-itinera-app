import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

import { EditPartState, EditPartStoreApi } from '@myrmidon/cadmus-state';

import { LITERARY_WORK_INFO_PART_TYPEID } from '../literary-work-info-part';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: LITERARY_WORK_INFO_PART_TYPEID })
export class EditLiteraryWorkInfoPartStore
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
