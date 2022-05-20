import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PoemLayoutRow } from '../services/poem-layout-table';

/**
 * An editable poem range layout.
 */
@Component({
  selector: 'cadmus-cod-poem-ranges-layout',
  templateUrl: './cod-poem-ranges-layout.component.html',
  styleUrls: ['./cod-poem-ranges-layout.component.css'],
})
export class CodPoemRangesLayoutComponent implements OnInit {
  private _layout: PoemLayoutRow | undefined;

  @Input()
  public get layout(): PoemLayoutRow | undefined {
    return this._layout;
  }
  public set layout(value: PoemLayoutRow | undefined) {
    this._layout = value;
    this.updateForm(value);
  }

  @Output()
  public layoutCheck: EventEmitter<PoemLayoutRow>;
  @Output()
  public layoutSave: EventEmitter<PoemLayoutRow>;

  public editingNote?: boolean;
  public note: FormControl;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // events
    this.layoutCheck = new EventEmitter<PoemLayoutRow>();
    this.layoutSave = new EventEmitter<PoemLayoutRow>();
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
    this.note.setValue(layout.note);
    this.form.markAsPristine();
  }

  public setCheck(): void {
    if (!this._layout) {
      return;
    }
    this.layoutCheck.emit(this._layout);
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
    this._layout!.note = note ? note : undefined;
    this.layoutSave.emit(this._layout);
  }
}
