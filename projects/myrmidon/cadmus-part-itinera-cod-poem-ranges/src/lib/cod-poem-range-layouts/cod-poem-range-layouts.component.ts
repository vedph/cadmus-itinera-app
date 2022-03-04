import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Observable } from 'rxjs';
import { CodPoemLayout } from '../cod-poem-ranges-part';

import { AlnumRange } from '../services/alnum-range.service';
import { PoemLayoutRow, PoemLayoutTable } from '../services/poem-layout-table';

/**
 * Poem ranges layouts editor. This displays all the poem ranges in their
 * expanded form, allowing the user to select one or more consecutive rows
 * and apply them a selected layout.
 */
@Component({
  selector: 'cadmus-cod-poem-range-layouts',
  templateUrl: './cod-poem-range-layouts.component.html',
  styleUrls: ['./cod-poem-range-layouts.component.css'],
})
export class CodPoemRangeLayoutsComponent implements OnInit {
  private readonly _table: PoemLayoutTable;
  private _ranges: AlnumRange[];
  private _layouts: CodPoemLayout[];

  public rows$: Observable<PoemLayoutRow[]>;

  public layout: FormControl;
  public form: FormGroup;

  /**
   * The ranges defined for poems.
   */
  @Input()
  public get ranges(): AlnumRange[] {
    return this._ranges;
  }
  public set ranges(value: AlnumRange[]) {
    this._ranges = value;
    this.updateTable();
  }

  /**
   * The layouts to edit.
   */
  @Input()
  public get layouts(): CodPoemLayout[] {
    return this._layouts;
  }
  public set layouts(value: CodPoemLayout[]) {
    this._layouts = value;
    if (this._ranges.length) {
      this.updateTable();
    }
  }

  // cod-poem-range-layouts
  @Input()
  public layoutEntries: ThesaurusEntry[] | undefined;

  /**
   * Emitted when layouts are saved.
   */
  @Output()
  public layoutsChange: EventEmitter<CodPoemLayout[]>;

  constructor(formBuilder: FormBuilder) {
    this._table = new PoemLayoutTable();
    this._ranges = [];
    this._layouts = [];
    this.rows$ = this._table.rows$;
    this.layoutsChange = new EventEmitter<CodPoemLayout[]>();
    // form
    this.layout = formBuilder.control(null, Validators.maxLength(50));
    this.form = formBuilder.group({
      layout: this.layout,
    });
  }

  ngOnInit(): void {}

  private updateTable(): void {
    this._table.setRows(this._ranges);
    this._table.setLayouts(this._layouts);
  }

  public applyLayout(): void {
    if (this.form.invalid) {
      return;
    }
    this._table.setCheckedLayout(this.layout.value);
  }

  public setCheck(index: number): void {
    this._table.setCheck(index);
  }

  public clearLayout(index: number): void {
    this._table.setLayout(index, null);
  }

  public save(): void {
    // TODO compact and emit
  }
}
