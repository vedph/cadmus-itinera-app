import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject } from '@myrmidon/cadmus-core';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import {
  Witness,
  WitnessesPart,
  WITNESSES_PART_TYPEID,
} from '../witnesses-part';
import { WitnessComponent } from '../witness/witness.component';

/**
 * WitnessesPart editor component.
 * Thesauri: none.
 */
@Component({
  selector: 'cadmus-witnesses-part',
  templateUrl: './witnesses-part.component.html',
  styleUrls: ['./witnesses-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    CodLocationRangePipe,
  ],
})
export class WitnessesPartComponent
  extends ModelEditorComponentBase<WitnessesPart>
  implements OnInit
{
  public readonly editedWitness = signal<Witness | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  public witnesses: FormControl<Witness[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.witnesses = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      witnesses: this.witnesses,
    });
  }

  private updateForm(part?: WitnessesPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.witnesses.setValue(part.witnesses || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<WitnessesPart>): void {
    this.updateForm(data?.value);
  }

  protected getValue(): WitnessesPart {
    let part = this.getEditedPart(WITNESSES_PART_TYPEID) as WitnessesPart;
    part.witnesses = this.witnesses.value || [];
    return part;
  }

  public addWitness(): void {
    const witness: Witness = {
      id: '',
      ranges: [],
    };
    this.witnesses.setValue([...this.witnesses.value, witness]);
    this.witnesses.updateValueAndValidity();
    this.witnesses.markAsDirty();
    this.editWitness(this.witnesses.value.length - 1);
  }

  public editWitness(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedWitness.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedWitness.set(deepCopy(this.witnesses.value[index]));
    }
  }

  public onWitnessSave(entry: Witness): void {
    this.witnesses.setValue(
      this.witnesses.value.map((e: Witness, i: number) =>
        i === this.editedIndex() ? entry : e
      )
    );
    this.witnesses.updateValueAndValidity();
    this.witnesses.markAsDirty();
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
          const witnesses = [...this.witnesses.value];
          witnesses.splice(index, 1);
          this.witnesses.setValue(witnesses);
          this.witnesses.updateValueAndValidity();
          this.witnesses.markAsDirty();
        }
      });
  }

  public moveWitnessUp(index: number): void {
    if (index < 1) {
      return;
    }
    const witness = this.witnesses.value[index];
    const witnesses = [...this.witnesses.value];
    witnesses.splice(index, 1);
    witnesses.splice(index - 1, 0, witness);
    this.witnesses.setValue(witnesses);
    this.witnesses.updateValueAndValidity();
    this.witnesses.markAsDirty();
  }

  public moveWitnessDown(index: number): void {
    if (index + 1 >= this.witnesses.value.length) {
      return;
    }
    const witness = this.witnesses.value[index];
    const witnesses = [...this.witnesses.value];
    witnesses.splice(index, 1);
    witnesses.splice(index + 1, 0, witness);
    this.witnesses.setValue(witnesses);
    this.witnesses.updateValueAndValidity();
    this.witnesses.markAsDirty();
  }
}
