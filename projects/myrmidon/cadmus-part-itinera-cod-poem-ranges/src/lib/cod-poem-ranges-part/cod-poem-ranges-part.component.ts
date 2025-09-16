import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';

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
import { CodPoemRangeLayoutsComponent } from '../cod-poem-range-layouts/cod-poem-range-layouts.component';
import { AlnumRangePipe } from '../pipes/alnum-range.pipe';

/**
 * CodPoemRanges part editor component.
 * Thesauri: cod-poem-range-sort-types, cod-poem-range-layouts, cod-poem-range-tags
 * (all optional).
 */
@Component({
  selector: 'cadmus-cod-poem-ranges-part',
  templateUrl: './cod-poem-ranges-part.component.html',
  styleUrls: ['./cod-poem-ranges-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatIconButton,
    MatTooltip,
    CodPoemRangeLayoutsComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    AlnumRangePipe,
  ],
})
export class CodPoemRangesPartComponent
  extends ModelEditorComponentBase<CodPoemRangesPart>
  implements OnInit
{
  // cod-poem-range-sort-types
  public readonly sortEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-poem-range-layouts
  public readonly layoutEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // cod-poem-range-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public sortType: FormControl<string | null>;
  public ranges: FormControl<AlnumRange[]>;
  public layouts: FormControl<CodPoemLayout[]>;
  public tag: FormControl<string | null>;
  public note: FormControl<string | null>;

  // sub-form
  public addedRanges: FormControl<string | null>;
  public addForm: FormGroup;

  @ViewChild('adder')
  public adderRef?: ElementRef;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _alnumService: AlnumRangeService,
    private _dialogService: DialogService,
    private _snackbar: MatSnackBar
  ) {
    super(authService, formBuilder);
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
      this.sortEntries.set(thesauri[key].entries);
    } else {
      this.sortEntries.set(undefined);
    }
    key = 'cod-poem-range-layouts';
    if (this.hasThesaurus(key)) {
      this.layoutEntries.set(thesauri[key].entries);
    } else {
      this.layoutEntries.set(undefined);
    }
    key = 'cod-poem-range-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
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
        : this.sortEntries()?.length
        ? this.sortEntries()![0].id
        : '',
      { emitEvent: false }
    );
    this.ranges.setValue(part.ranges || [], { emitEvent: false });
    this.layouts.setValue(part.layouts || [], { emitEvent: false });
    this.tag.setValue(part.tag || null, { emitEvent: false });
    this.note.setValue(part.note || null, { emitEvent: false });
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
      this.ranges.setValue(this.ranges.value);
      this.layouts.setValue(this.layouts.value);
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
