import {
  ChangeDetectionStrategy,
  Component,
  effect,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { Witness } from '../witnesses-part';

interface WitnessControls {
  id: string;
  ranges: CodLocationRange[];
}

function toDraft(witness?: Witness): WitnessControls {
  return {
    id: witness?.id || '',
    ranges: copyFormValue(witness?.ranges || []),
  };
}

@Component({
  selector: 'cadmus-witness',
  templateUrl: './witness.component.html',
  styleUrls: ['./witness.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class WitnessComponent {
  public readonly witness = model<Witness>();

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.witness()));
  public readonly form = form(this._draft, (p) => {
    required(p.id);
    maxLength(p.id, 500);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
  });

  constructor() {
    // a new witness was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.witness();
      untracked(() => this.form().reset());
    });
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    setFieldFromChild(this.form.ranges, copyFormValue(ranges || []));
  }

  private getWitness(): Witness {
    const draft = this._draft();
    return {
      id: draft.id.trim(),
      ranges: copyFormValue(draft.ranges),
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  /**
   * Handle Enter in this editor: in a text input, save as the save button
   * would, when enabled. This replaces the implicit submission of the form
   * this editor used to render.
   * @param event The keydown event.
   */
  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.witness.set(this.getWitness());
  }
}
