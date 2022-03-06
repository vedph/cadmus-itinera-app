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
  private readonly _presets = [
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
  public sortType: FormControl;
  public ranges: FormControl;
  public layouts: FormControl;

  public initialRanges: AlnumRange[];
  public initialLayouts: CodPoemLayout[];

  // sub-form
  public addedRanges: FormControl;
  public addedPresets: FormControl;
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
    this.ranges = formBuilder.control([]);
    this.layouts = formBuilder.control([]);
    this.form = formBuilder.group({
      sortType: this.sortType,
      ranges: this.ranges,
      layouts: this.layouts,
    });
    this.addedRanges = formBuilder.control(null, [
      Validators.required,
      Validators.pattern(new RegExp(ALNUM_RANGE_PATTERN, 'g')),
    ]);
    this.addedPresets = formBuilder.control(null);
    this.addForm = formBuilder.group({
      addedRanges: this.addedRanges,
      addedPresets: this.addedPresets,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
    // when a preset is picked, set the adder to it
    this.addedPresets.valueChanges.subscribe((value) => {
      if (value !== undefined) {
        this.addedRanges.setValue(this._presets[value]);
        this.addedRanges.updateValueAndValidity();
        setTimeout(() => {
          this.adderRef?.nativeElement.focus();
        }, 0);
      }
    });
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
    part.sortType = this.sortType.value;
    part.ranges = this.ranges.value?.length ? this.ranges.value : undefined;
    part.layouts = this.layouts.value?.length ? this.layouts.value : undefined;
    return part;
  }

  public addRanges(): void {
    if (this.addForm.invalid) {
      return;
    }
    const newRanges = this._alnumService.parseRanges(this.addedRanges.value);
    if (newRanges.length) {
      // insert each range at its place according to its A value
      const ranges: AlnumRange[] = [...this.ranges.value];

      for (let i = 0; i < newRanges.length; i++) {
        const add = Alnum.parse(newRanges[i].a);
        if (!add) {
          continue;
        }
        let j = 0;
        while (j < ranges.length) {
          const current = Alnum.parse(ranges[j].a);
          const n = add.compare(current);
          if (n === 0) {
            break;
          }
          if (n < 0) {
            ranges.splice(j, 0, newRanges[i]);
            break;
          }
          j++;
        }
        if (j === ranges.length) {
          ranges.push(newRanges[i]);
        }
      }

      this.ranges.setValue(ranges);
      this.ranges.markAsDirty();
      this.addedRanges.reset();
    }
  }

  public deleteRange(index: number): void {
    const newRanges = [...this.ranges.value];
    newRanges.splice(index, 1);
    this.ranges.setValue(newRanges);
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
    this.layouts.markAsDirty();
  }
}
