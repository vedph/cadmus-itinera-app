import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodLociPart, CodLocus, COD_LOCI_PART_TYPEID } from '../cod-loci-part';

/**
 * CodLociPart editor component.
 * Thesauri: cod-image-types (optional).
 */
@Component({
  selector: 'cadmus-cod-loci-part',
  templateUrl: './cod-loci-part.component.html',
  styleUrls: ['./cod-loci-part.component.css'],
})
export class CodLociPartComponent
  extends ModelEditorComponentBase<CodLociPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedLocus: CodLocus | undefined;

  // cod-image-types
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  public loci: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.loci = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      loci: this.loci,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: CodLociPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.loci.setValue(model.loci || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: CodLociPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    const key = 'cod-image-types';
    if (this.thesauri && this.thesauri[key]) {
      this.imgTypeEntries = this.thesauri[key].entries;
    } else {
      this.imgTypeEntries = undefined;
    }
  }

  protected getModelFromForm(): CodLociPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: COD_LOCI_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        loci: [],
      };
    }
    part.loci = this.loci.value || [];
    return part;
  }

  public addLocus(): void {
    const entry: CodLocus = {
      citation: '',
      range: { start: { n: 0 }, end: { n: 0 } },
      text: ''
    };
    this.loci.setValue([...this.loci.value, entry]);
    this.editLocus(this.loci.value.length - 1);
  }

  public editLocus(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedLocus = undefined;
    } else {
      this._editedIndex = index;
      this.editedLocus = this.loci.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onLocusSave(entry: CodLocus): void {
    this.loci.setValue(
      this.loci.value.map((e: CodLocus, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
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
          const entries = [...this.loci.value];
          entries.splice(index, 1);
          this.loci.setValue(entries);
          this.loci.updateValueAndValidity();
          this.loci.markAsDirty();
              }
      });
  }

  public moveLocusUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.loci.value[index];
    const entries = [...this.loci.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.loci.setValue(entries);
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
  }

  public moveLocusDown(index: number): void {
    if (index + 1 >= this.loci.value.length) {
      return;
    }
    const entry = this.loci.value[index];
    const entries = [...this.loci.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.loci.setValue(entries);
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
  }
}
