import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';
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
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
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
import { CodPoemRangeLayoutsComponent } from '../cod-poem-range-layouts/cod-poem-range-layouts.component';
import { AlnumRangePipe } from '../pipes/alnum-range.pipe';

interface CodPoemRangesPartControls {
  sortType: string;
  ranges: AlnumRange[];
  layouts: CodPoemLayout[];
  tag: string;
  note: string;
}

function toDraft(
  part: CodPoemRangesPart | null | undefined,
  sortEntries: ThesaurusEntry[] | undefined,
): CodPoemRangesPartControls {
  return {
    // a part without type gets the first type available, if any
    sortType: part
      ? part.sortType || (sortEntries?.length ? sortEntries[0].id : '')
      : '',
    ranges: copyFormValue(part?.ranges || []),
    layouts: copyFormValue(part?.layouts || []),
    tag: part?.tag || '',
    note: part?.note || '',
  };
}

/**
 * CodPoemRanges part editor component.
 * Thesauri: cod-poem-range-sort-types, cod-poem-range-layouts, cod-poem-range-tags
 * (all optional).
 */
@Component({
  selector: 'cadmus-cod-poem-ranges-part',
  templateUrl: './cod-poem-ranges-part.component.html',
  styleUrls: ['./cod-poem-ranges-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
    MatCardActions,
    TitleCasePipe,
    CodPoemRangeLayoutsComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
    AlnumRangePipe,
  ],
})
export class CodPoemRangesPartComponent extends ModelEditorComponentBase<CodPoemRangesPart> {
  private readonly _alnumService = inject(AlnumRangeService);
  private readonly _dialogService = inject(DialogService);
  private readonly _snackbar = inject(MatSnackBar);

  // cod-poem-range-sort-types
  public readonly sortEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-poem-range-sort-types']?.entries,
  );
  // cod-poem-range-layouts
  public readonly layoutEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-poem-range-layouts']?.entries,
  );
  // cod-poem-range-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-poem-range-tags']?.entries,
  );

  private readonly _draft = linkedSignal(() =>
    toDraft(this.data()?.value, this.sortEntries()),
  );
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.sortType);
    maxLength(p.sortType, 50);
    maxLength(p.tag, 50);
    maxLength(p.note, 1000);
  });

  // sub-form: the ranges to add, not part of the model
  public readonly addForm = form(signal({ addedRanges: '' }), (p) => {
    required(p.addedRanges);
    pattern(p.addedRanges, new RegExp(ALNUM_RANGE_PATTERN));
  });

  @ViewChild('adder')
  public adderRef?: ElementRef;

  protected getValue(): CodPoemRangesPart {
    let part = this.getEditedPart(
      COD_POEM_RANGES_PART_TYPEID,
    ) as CodPoemRangesPart;
    const draft = this._draft();
    part.sortType = draft.sortType.trim();
    part.ranges = draft.ranges.length ? copyFormValue(draft.ranges) : undefined;
    part.layouts = draft.layouts.length
      ? copyFormValue(draft.layouts)
      : undefined;
    part.tag = draft.tag.trim() || undefined;
    part.note = draft.note.trim() || undefined;
    return part;
  }

  private setRanges(ranges: AlnumRange[]): void {
    this.form.ranges().value.set(ranges);
    this.form.ranges().markAsDirty();
  }

  public addRanges(): void {
    if (this.addForm().invalid()) {
      return;
    }
    const newRanges = this._alnumService.parseRanges(
      this.addForm.addedRanges().value(),
    );
    if (newRanges.length) {
      this.setRanges([...this.form.ranges().value(), ...newRanges]);
      this.addForm.addedRanges().value.set('');
      this.addForm().reset();
    }
  }

  public deleteRange(index: number): void {
    const newRanges = [...this.form.ranges().value()];
    newRanges.splice(index, 1);
    this.setRanges(newRanges);
  }

  public deleteAllRanges(): void {
    if (!this.form.ranges().value().length) {
      return;
    }
    this._dialogService
      .confirm('Clear Ranges', 'Delete all the ranges?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          this.setRanges([]);
        }
      });
  }

  public moveRangeUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.form.ranges().value()[index];
    const items = [...this.form.ranges().value()];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.setRanges(items);
  }

  public moveRangeDown(index: number): void {
    if (index + 1 >= this.form.ranges().value().length) {
      return;
    }
    const item = this.form.ranges().value()[index];
    const items = [...this.form.ranges().value()];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.setRanges(items);
  }

  public onLayoutsChange(layouts: CodPoemLayout[]): void {
    this.form.layouts().value.set(copyFormValue(layouts));
    this.form.layouts().markAsDirty();
    this._snackbar.open('Layout applied', 'OK', {
      duration: 1500,
    });
  }
}
