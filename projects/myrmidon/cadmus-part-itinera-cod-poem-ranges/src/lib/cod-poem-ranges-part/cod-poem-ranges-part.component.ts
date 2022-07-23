import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';

import { deepCopy } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CodPoemLayout,
  CodPoemRangesPart,
  COD_POEM_RANGES_PART_TYPEID,
} from '../cod-poem-ranges-part';
import {
  AlnumRange,
  AlnumRangeService,
  ALNUM_RANGE_PATTERN,
} from '../services/alnum-range.service';
import { Alnum } from '../services/alnum';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { take } from 'rxjs';

/**
 * CodPoemRanges part editor component.
 * Thesauri: cod-poem-range-sort-types, cod-poem-range-layouts (optional).
 */
@Component({
  selector: 'cadmus-cod-poem-ranges-part',
  templateUrl: './cod-poem-ranges-part.component.html',
  styleUrls: ['./cod-poem-ranges-part.component.css'],
})
export class CodPoemRangesPartComponent
  extends ModelEditorComponentBase<CodPoemRangesPart>
  implements OnInit
{
  public sortType: FormControl<string | null>;
  public ranges: FormControl<AlnumRange[]>;
  public layouts: FormControl<CodPoemLayout[]>;
  public note: FormControl<string | null>;

  public initialRanges: AlnumRange[];
  public initialLayouts: CodPoemLayout[];

  // sub-form
  public addedRanges: FormControl<string | null>;
  public addForm: FormGroup;

  @ViewChild('adder')
  public adderRef?: ElementRef;

  // cod-poem-range-sort-types
  public sortEntries: ThesaurusEntry[] | undefined;
  // cod-poem-range-layouts
  public layoutEntries: ThesaurusEntry[] | undefined;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _alnumService: AlnumRangeService,
    private _dialogService: DialogService
  ) {
    super(authService);
    this.initialRanges = [];
    this.initialLayouts = [];
    // form
    this.sortType = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], { nonNullable: true });
    this.layouts = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      sortType: this.sortType,
      ranges: this.ranges,
      layouts: this.layouts,
      note: this.note,
    });
    this.addedRanges = formBuilder.control(null, [
      Validators.required,
      Validators.pattern(new RegExp(ALNUM_RANGE_PATTERN, 'g')),
    ]);
    this.addForm = formBuilder.group({
      addedRanges: this.addedRanges,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodPoemRangesPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.sortType.setValue(
      model.sortType
        ? model.sortType
        : this.sortEntries?.length
        ? this.sortEntries[0].id
        : ''
    );
    this.ranges.setValue(model.ranges || []);
    this.layouts.setValue(model.layouts || []);
    this.note.setValue(model.note || null);
    // for layouts control
    this.initialRanges = this.ranges.value;
    this.initialLayouts = this.layouts.value;
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodPoemRangesPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'cod-poem-range-sort-types';
    if (this.thesauri && this.thesauri[key]) {
      this.sortEntries = this.thesauri[key].entries;
    } else {
      this.sortEntries = undefined;
    }
    key = 'cod-poem-range-layouts';
    if (this.thesauri && this.thesauri[key]) {
      this.layoutEntries = this.thesauri[key].entries;
    } else {
      this.layoutEntries = undefined;
    }
  }

  protected getModelFromForm(): CodPoemRangesPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_POEM_RANGES_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        sortType: '',
      };
    }
    part.sortType = this.sortType.value || '';
    part.ranges = this.ranges.value?.length ? this.ranges.value : undefined;
    part.layouts = this.layouts.value?.length ? this.layouts.value : undefined;
    part.note = this.note.value?.trim();
    return part;
  }

  public addRanges(): void {
    if (this.addForm.invalid) {
      return;
    }
    const newRanges = this._alnumService.parseRanges(this.addedRanges.value);
    if (newRanges.length) {
      const ranges: AlnumRange[] = [...this.ranges.value, ...newRanges];

      this.ranges.setValue(ranges);
      this.ranges.updateValueAndValidity();
      this.ranges.markAsDirty();
      this.addedRanges.reset();
    }
  }

  public deleteRange(index: number): void {
    const newRanges = [...this.ranges.value];
    newRanges.splice(index, 1);
    this.ranges.setValue(newRanges);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public deleteAllRanges(): void {
    if (!this.ranges.value.length) {
      return;
    }
    this._dialogService
      .confirm('Clear Ranges', 'Delete all the ranges?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this.ranges.setValue([]);
          this.ranges.updateValueAndValidity();
          this.ranges.markAsDirty();
        }
      });
  }

  public moveRangeUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.ranges.value[index];
    const items = [...this.ranges.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.ranges.setValue(items);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public moveRangeDown(index: number): void {
    if (index + 1 >= this.ranges.value.length) {
      return;
    }
    const item = this.ranges.value[index];
    const items = [...this.ranges.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.ranges.setValue(items);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onTabIndexChange(index: number): void {
    // whenever we move on layouts, update them if ranges changed
    if (index === 1 && this.ranges.dirty) {
      this.initialRanges = this.ranges.value;
      this.initialLayouts = this.layouts.value;
    }
  }

  public onLayoutsChange(layouts: CodPoemLayout[]): void {
    this.layouts.setValue(layouts);
    this.layouts.updateValueAndValidity();
    this.layouts.markAsDirty();
  }
}
