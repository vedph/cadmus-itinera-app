import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';

import {
  Witness,
  WitnessesPart,
  WITNESSES_PART_TYPEID,
} from '../witnesses-part';

/**
 * WitnessesPart editor component.
 * Thesauri: none.
 */
@Component({
  selector: 'cadmus-witnesses-part',
  templateUrl: './witnesses-part.component.html',
  styleUrls: ['./witnesses-part.component.css'],
})
export class WitnessesPartComponent
  extends ModelEditorComponentBase<WitnessesPart>
  implements OnInit
{
  private _editedIndex: number;

  public editedWitness: Witness | undefined;

  public witnesses: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    // form
    this.witnesses = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      witnesses: this.witnesses,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: WitnessesPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.witnesses.setValue(model.witnesses || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: WitnessesPart): void {
    this.updateForm(deepCopy(model));
  }

  protected getModelFromForm(): WitnessesPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: WITNESSES_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        witnesses: [],
      };
    }
    part.witnesses = this.witnesses.value || [];
    return part;
  }

  public addWitness(): void {
    const witness: Witness = {
      id: '',
      range: { start: { n: 0 }, end: { n: 0 } },
    };
    this.witnesses.setValue([...this.witnesses.value, witness]);
    this.editWitness(this.witnesses.value.length - 1);
  }

  public editWitness(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.editedWitness = undefined;
    } else {
      this._editedIndex = index;
      this.editedWitness = this.witnesses.value[index];
    }
  }

  public onWitnessSave(entry: Witness): void {
    this.witnesses.setValue(
      this.witnesses.value.map((e: Witness, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
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
  }
}
