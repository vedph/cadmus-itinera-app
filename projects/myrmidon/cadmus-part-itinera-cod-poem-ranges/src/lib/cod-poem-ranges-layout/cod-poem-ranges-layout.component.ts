import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { deepCopy } from '@myrmidon/ngx-tools';
import {
  CodPoemLayoutCheckMode,
  PoemLayoutRow,
} from '../services/poem-layout-table';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatLabel, MatFormField, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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
export class CodPoemRangesLayoutComponent implements OnInit {
  private _layout: PoemLayoutRow | undefined;

  @Input()
  public get layout(): PoemLayoutRow | undefined {
    return this._layout;
  }
  public set layout(value: PoemLayoutRow | undefined) {
    if (this._layout === value) {
      return;
    }
    this._layout = value;
    this.updateForm(value);
  }

  @Output()
  public layoutCheck: EventEmitter<{
    layout: PoemLayoutRow;
    mode: CodPoemLayoutCheckMode;
  }>;

  @Output()
  public layoutSave: EventEmitter<PoemLayoutRow>;

  @Output()
  public numbersCheck: EventEmitter<{ numbers: string[]; checked: boolean }>;

  public editingNote?: boolean;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // events
    this.layoutCheck = new EventEmitter<{
      layout: PoemLayoutRow;
      mode: CodPoemLayoutCheckMode;
    }>();
    this.layoutSave = new EventEmitter<PoemLayoutRow>();
    this.numbersCheck = new EventEmitter<{
      numbers: string[];
      checked: boolean;
    }>();
    // form
    this.note = formBuilder.control(null, Validators.maxLength(500));
    this.form = formBuilder.group({
      note: this.note,
    });
  }

  ngOnInit(): void {}

  private updateForm(layout?: PoemLayoutRow): void {
    this.editingNote = false;
    if (!layout) {
      this.form.reset();
      return;
    }
    this.note.setValue(layout.note || null);
    this.form.markAsPristine();
  }

  public setCheck(event: MouseEvent): void {
    if (!this._layout) {
      return;
    }
    let mode = CodPoemLayoutCheckMode.Single;
    if (event.shiftKey) {
      mode = CodPoemLayoutCheckMode.Range;
    } else if (event.ctrlKey || event.altKey) {
      mode = CodPoemLayoutCheckMode.Add;
    }
    this.layoutCheck.emit({ layout: this._layout, mode: mode });
  }

  public clearLayout(): void {
    if (!this._layout) {
      return;
    }
    this.cancelNote();
    this._layout.checked = false;
    this._layout.layout = undefined;
    this._layout.note = undefined;
    this.layoutSave.emit(this._layout);
  }

  public editNote(): void {
    this.editingNote = true;
  }

  public cancelNote(): void {
    this.editingNote = false;
  }

  public saveNote(): void {
    this.cancelNote();
    const note = this.note.value?.trim();
    const l = deepCopy(this._layout);
    l.note = note;
    this._layout = l;
    this.layoutSave.emit(this._layout);
  }
}
