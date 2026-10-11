import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { CodLociPart, CodLocus, COD_LOCI_PART_TYPEID } from '../cod-loci-part';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { CodLocusComponent } from '../cod-locus/cod-locus.component';

interface CodLociPartControls {
  loci: CodLocus[];
}

function toDraft(part?: CodLociPart | null): CodLociPartControls {
  return { loci: copyFormValue(part?.loci || []) };
}

/**
 * CodLociPart editor component.
 * Thesauri: cod-loci, cod-image-types (all optional).
 */
@Component({
  selector: 'cadmus-cod-loci-part',
  templateUrl: './cod-loci-part.component.html',
  styleUrls: ['./cod-loci-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatTabGroup,
    MatTab,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodLocusComponent,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
    CodLocationRangePipe,
  ],
})
export class CodLociPartComponent extends ModelEditorComponentBase<CodLociPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedLocus = signal<CodLocus | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);
  public readonly tabIndex = signal<number>(0);

  // cod-loci
  public readonly locEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-loci']?.entries,
  );
  // cod-image-types
  public readonly imgTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-image-types']?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.loci, 1);
  });

  protected getValue(): CodLociPart {
    let part = this.getEditedPart(COD_LOCI_PART_TYPEID) as CodLociPart;
    part.loci = copyFormValue(this._draft().loci);
    return part;
  }

  private setLoci(loci: CodLocus[]): void {
    this.form.loci().value.set(loci);
    this.form.loci().markAsDirty();
  }

  public addLocus(): void {
    const entry: CodLocus = {
      citation: '',
      range: { start: { n: 0 }, end: { n: 0 } },
      text: '',
    };
    this.setLoci([...this.form.loci().value(), entry]);
    this.editLocus(this.form.loci().value().length - 1);
  }

  public editLocus(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.tabIndex.set(0);
      this.editedLocus.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedLocus.set(copyFormValue(this.form.loci().value()[index]));
      setTimeout(() => {
        this.tabIndex.set(1);
      }, 300);
    }
  }

  public onLocusSave(entry: CodLocus): void {
    this.setLoci(
      this.form
        .loci()
        .value()
        .map((e: CodLocus, i: number) =>
          i === this.editedIndex() ? entry : e,
        ),
    );
    this.editLocus(-1);
  }

  public onLocusClose(): void {
    this.editLocus(-1);
  }

  public deleteLocus(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete locus?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.form.loci().value()];
          entries.splice(index, 1);
          this.setLoci(entries);
          // keep the edited locus in sync with the changed list
          if (index === this.editedIndex()) {
            this.editLocus(-1);
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited locus in sync after the loci at the
   * specified indexes were swapped.
   */
  private onLociSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveLocusUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.loci().value()[index];
    const entries = [...this.form.loci().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.setLoci(entries);
    this.onLociSwapped(index, index - 1);
  }

  public moveLocusDown(index: number): void {
    if (index + 1 >= this.form.loci().value().length) {
      return;
    }
    const entry = this.form.loci().value()[index];
    const entries = [...this.form.loci().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.setLoci(entries);
    this.onLociSwapped(index, index + 1);
  }
}
