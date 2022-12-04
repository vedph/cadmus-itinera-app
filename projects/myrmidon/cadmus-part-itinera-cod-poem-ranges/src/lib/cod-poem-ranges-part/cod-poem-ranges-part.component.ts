import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

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

/**
 * CodPoemRanges part editor component.
 * Thesauri: cod-poem-range-sort-types, cod-poem-range-layouts, cod-poem-range-tags
 * (all optional).
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
  public tag: FormControl<string | null>;
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
  // cod-poem-range-tags
  public tagEntries: ThesaurusEntry[] | undefined;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _alnumService: AlnumRangeService,
    private _dialogService: DialogService,
    private _snackbar: MatSnackBar
  ) {
    super(authService, formBuilder);
    this.initialRanges = [];
    this.initialLayouts = [];
    // form
    this.sortType = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], { nonNullable: true });
    this.layouts = formBuilder.control([], { nonNullable: true });
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.addedRanges = formBuilder.control(null, [
      Validators.required,
      Validators.pattern(new RegExp(ALNUM_RANGE_PATTERN, 'g')),
    ]);
    this.addForm = formBuilder.group({
      addedRanges: this.addedRanges,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      sortType: this.sortType,
      ranges: this.ranges,
      layouts: this.layouts,
      tag: this.tag,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-poem-range-sort-types';
    if (this.hasThesaurus(key)) {
      this.sortEntries = thesauri[key].entries;
    } else {
      this.sortEntries = undefined;
    }
    key = 'cod-poem-range-layouts';
    if (this.hasThesaurus(key)) {
      this.layoutEntries = thesauri[key].entries;
    } else {
      this.layoutEntries = undefined;
    }
    key = 'cod-poem-range-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries = thesauri[key].entries;
    } else {
      this.tagEntries = undefined;
    }
  }

  private updateForm(part?: CodPoemRangesPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.sortType.setValue(
      part.sortType
        ? part.sortType
        : this.sortEntries?.length
        ? this.sortEntries[0].id
        : ''
    );
    this.ranges.setValue(part.ranges || []);
    this.layouts.setValue(part.layouts || []);
    this.tag.setValue(part.tag || null);
    this.note.setValue(part.note || null);
    // for layouts control
    this.initialRanges = this.ranges.value;
    this.initialLayouts = this.layouts.value;
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodPoemRangesPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodPoemRangesPart {
    let part = this.getEditedPart(
      COD_POEM_RANGES_PART_TYPEID
    ) as CodPoemRangesPart;
    part.sortType = this.sortType.value || '';
    part.ranges = this.ranges.value?.length ? this.ranges.value : undefined;
    part.layouts = this.layouts.value?.length ? this.layouts.value : undefined;
    part.tag = this.tag.value?.trim();
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
    this._snackbar.open('Layout applied', 'OK', {
      duration: 1500,
    });
  }
}
