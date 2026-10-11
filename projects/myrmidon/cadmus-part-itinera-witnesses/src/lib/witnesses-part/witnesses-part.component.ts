import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';

import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  Witness,
  WitnessesPart,
  WITNESSES_PART_TYPEID,
} from '../witnesses-part';
import { WitnessComponent } from '../witness/witness.component';

interface WitnessesPartControls {
  witnesses: Witness[];
}

function toDraft(part?: WitnessesPart | null): WitnessesPartControls {
  return { witnesses: copyFormValue(part?.witnesses || []) };
}

/**
 * WitnessesPart editor component.
 * Thesauri: none.
 */
@Component({
  selector: 'cadmus-witnesses-part',
  templateUrl: './witnesses-part.component.html',
  styleUrls: ['./witnesses-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    WitnessComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
    CodLocationRangePipe,
  ],
})
export class WitnessesPartComponent extends ModelEditorComponentBase<WitnessesPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedWitness = signal<Witness | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.witnesses, 1);
  });

  protected getValue(): WitnessesPart {
    let part = this.getEditedPart(WITNESSES_PART_TYPEID) as WitnessesPart;
    part.witnesses = copyFormValue(this._draft().witnesses);
    return part;
  }

  public addWitness(): void {
    const witness: Witness = {
      id: '',
      ranges: [],
    };
    this.form.witnesses().value.set([...this.form.witnesses().value(), witness]);
    this.form.witnesses().markAsDirty();
    this.editWitness(this.form.witnesses().value().length - 1);
  }

  public editWitness(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedWitness.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedWitness.set(copyFormValue(this.form.witnesses().value()[index]));
    }
  }

  public onWitnessSave(entry: Witness): void {
    this.form.witnesses().value.set(
      this.form.witnesses().value().map((e: Witness, i: number) =>
        i === this.editedIndex() ? entry : e
      )
    );
    this.form.witnesses().markAsDirty();
    this.editWitness(-1);
  }

  public onWitnessClose(): void {
    this.editWitness(-1);
  }

  public deleteWitness(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete witness?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const witnesses = [...this.form.witnesses().value()];
          witnesses.splice(index, 1);
          this.form.witnesses().value.set(witnesses);
          this.form.witnesses().markAsDirty();
          // keep the edited witness in sync with the changed list
          if (index === this.editedIndex()) {
            this.editWitness(-1);
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited witness in sync after the witnesses at
   * the specified indexes were swapped.
   */
  private onWitnessesSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveWitnessUp(index: number): void {
    if (index < 1) {
      return;
    }
    const witness = this.form.witnesses().value()[index];
    const witnesses = [...this.form.witnesses().value()];
    witnesses.splice(index, 1);
    witnesses.splice(index - 1, 0, witness);
    this.form.witnesses().value.set(witnesses);
    this.form.witnesses().markAsDirty();
    this.onWitnessesSwapped(index, index - 1);
  }

  public moveWitnessDown(index: number): void {
    if (index + 1 >= this.form.witnesses().value().length) {
      return;
    }
    const witness = this.form.witnesses().value()[index];
    const witnesses = [...this.form.witnesses().value()];
    witnesses.splice(index, 1);
    witnesses.splice(index + 1, 0, witness);
    this.form.witnesses().value.set(witnesses);
    this.form.witnesses().markAsDirty();
    this.onWitnessesSwapped(index, index + 1);
  }
}
