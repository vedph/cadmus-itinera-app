import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PoemLayoutRow } from '../services/poem-layout-table';

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

  public editingNote?: boolean;
  public note: FormControl;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
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

  public cancelNote(): void {
    this.editingNote = false;
  }

  public saveNote(): void {
    this.editingNote = false;
    const note = this.note.value?.trim();
    this._layout!.note = note ? note : undefined;
  }
}
