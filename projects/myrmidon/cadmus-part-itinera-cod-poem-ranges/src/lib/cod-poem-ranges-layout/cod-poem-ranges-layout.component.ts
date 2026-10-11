import {
  ChangeDetectionStrategy,
  Component,
  effect,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength } from '@angular/forms/signals';

import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatLabel,
  MatFormField,
  MatSuffix,
  MatError,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import {
  CodPoemLayoutCheckMode,
  PoemLayoutRow,
} from '../services/poem-layout-table';
import { Alnum } from '../services/alnum';

/**
 * An editable poem range layout.
 */
@Component({
  selector: 'cadmus-cod-poem-ranges-layout',
  templateUrl: './cod-poem-ranges-layout.component.html',
  styleUrls: ['./cod-poem-ranges-layout.component.css'],
  // not OnPush: PoemLayoutTable changes its rows in place, so the bound row
  // is the same object with other content, and no signal notifies it
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatLabel,
    MatFormField,
    MatInput,
    FormField,
    MatSuffix,
    MatError,
  ],
})
export class CodPoemRangesLayoutComponent {
  public readonly row = model<PoemLayoutRow>();

  public readonly layoutCheck = output<{
    row: PoemLayoutRow;
    mode: CodPoemLayoutCheckMode;
  }>();

  public readonly numbersCheck = output<{
    numbers: string[];
    checked: boolean;
  }>();

  // the note editor is closed whenever a row is bound
  public readonly editingNote = linkedSignal({
    source: () => this.row(),
    computation: () => false,
  });

  private readonly _draft = linkedSignal(() => ({
    note: this.row()?.note || '',
  }));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.note, 500);
  });

  constructor() {
    // a new row was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.row();
      untracked(() => this.form().reset());
    });
  }

  public setCheck(event: MouseEvent): void {
    if (!this.row()) {
      return;
    }
    let mode = CodPoemLayoutCheckMode.Single;
    if (event.shiftKey) {
      mode = CodPoemLayoutCheckMode.Range;
    } else if (event.ctrlKey || event.altKey) {
      mode = CodPoemLayoutCheckMode.Add;
    }
    this.layoutCheck.emit({ row: this.row()!, mode: mode });
  }

  public clearLayout(): void {
    if (!this.row()) {
      return;
    }
    this.cancelNote();
    const nr: Alnum | undefined = this.row()?.nr;
    const row: PoemLayoutRow = {
      nr: new Alnum(nr?.n || 0, nr?.a),
      layout: undefined,
      checked: false,
      note: undefined,
    };
    this.row.set(row);
  }

  public editNote(): void {
    this.editingNote.set(true);
  }

  public cancelNote(): void {
    this.editingNote.set(false);
  }

  public saveNote(): void {
    this.cancelNote();
    const note = this._draft().note.trim();

    const nr: Alnum | undefined = this.row()?.nr;
    const row: PoemLayoutRow = {
      nr: new Alnum(nr?.n || 0, nr?.a),
      layout: this.row()?.layout,
      checked: this.row()?.checked,
      note: note,
    };

    this.row.set(row);
  }
}
