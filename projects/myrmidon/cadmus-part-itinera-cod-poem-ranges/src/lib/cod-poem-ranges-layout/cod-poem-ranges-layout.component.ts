import { Component, effect, model, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

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
  imports: [
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatLabel,
    MatFormField,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
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

  public readonly editingNote = signal<boolean>(false);

  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.form = formBuilder.group({
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.row());
    });
  }

  private updateForm(row?: PoemLayoutRow): void {
    this.editingNote.set(false);
    if (!row) {
      this.form.reset();
      return;
    }
    this.note.setValue(row.note || null);
    this.form.markAsPristine();
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
    const note = this.note.value?.trim();

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
