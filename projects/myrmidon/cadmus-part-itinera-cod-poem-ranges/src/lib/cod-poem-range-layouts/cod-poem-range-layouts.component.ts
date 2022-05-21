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
import { Alnum } from '../services/alnum';
import { AlnumRange, AlnumRangeService } from '../services/alnum-range.service';
import {
  CodPoemLayoutCheckMode,
  PoemLayoutRow,
  PoemLayoutTable,
} from '../services/poem-layout-table';

const PRESETS = [
  // sonetto
  '1-10 12-13 15-21 24-27 31-36 38-49 51 56-58 60-62 64-65 67-69 74-79 81-104 107-118 120 122-124 130-134 136-141 143-148 150-205 208-213 215-236 238 240-263 265-267 269 271-322 326-330 333-358 361-365',
  // canzone
  '23 28-29 37 50 53 70-73 105 119 125-129 135 206-207 264 268 270 323 325 331 359 360 366',
  // ballata
  '11 14 55 59 63 149 324',
  // madrigale
  '52 54 106 121',
  // sestina
  '22 30 66 80 142 214 237 239 332',
];

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
  public presets: FormControl;
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

  constructor(
    formBuilder: FormBuilder,
    private _alnumService: AlnumRangeService
  ) {
    this._table = new PoemLayoutTable();
    this._ranges = [];
    this._layouts = [];
    this.rows$ = this._table.rows$;
    this.layoutsChange = new EventEmitter<CodPoemLayout[]>();
    // form
    this.layout = formBuilder.control(null, Validators.maxLength(50));
    this.presets = formBuilder.control(null);
    this.form = formBuilder.group({
      layout: this.layout,
      presets: this.presets,
    });
  }

  ngOnInit(): void {}

  private updateTable(): void {
    this._table.setRows(this._ranges);
    this._table.setLayouts(this._layouts);
  }

  public onLayoutCheck(event: {
    layout: PoemLayoutRow;
    mode: CodPoemLayoutCheckMode;
  }): void {
    const i = this._table.getRowIndex(event.layout);
    if (i > -1) {
      this._table.setChecked(i, event.mode);
    }
  }

  public onLayoutSave(row: PoemLayoutRow): void {
    const i = this._table.getRowIndex(row);
    if (i > -1) {
      this._table.setRow(i, row);
    }
  }

  public applyLayout(): void {
    if (this.form.invalid) {
      return;
    }
    this._table.setCheckedLayout(this.layout.value);
  }

  public checkAllPoems(): void {
    this._table.toggleAllCheck(true);
  }

  public uncheckAllPoems(): void {
    this._table.toggleAllCheck(false);
  }

  public checkPreset(checked = true): void {
    if (!this.presets.value) {
      return;
    }
    const ranges = this._alnumService.parseRanges(
      PRESETS[+this.presets.value - 1]
    );
    const numbers: Alnum[] = this._alnumService
      .expandRanges(ranges)
      .map((s) => Alnum.parse(s)!);
    this._table.setCheckedGroup(numbers, checked);
  }

  public save(): void {
    this.layoutsChange.emit(this._table.getLayouts());
  }
}
