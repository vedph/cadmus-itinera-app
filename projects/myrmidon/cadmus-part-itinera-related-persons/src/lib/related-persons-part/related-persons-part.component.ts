import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  RelatedPerson,
  RelatedPersonsPart,
  RELATED_PERSONS_PART_TYPEID,
} from '../related-persons-part';

/**
 * RelatedPersonsPart editor component.
 * Thesauri: related-person-types, assertion-tags, doc-reference-types,
 * doc-reference-tags, external-id-scopes (all optional).
 */
@Component({
  selector: 'cadmus-related-persons-part',
  templateUrl: './related-persons-part.component.html',
  styleUrls: ['./related-persons-part.component.css'],
})
export class RelatedPersonsPartComponent
  extends ModelEditorComponentBase<RelatedPersonsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedPerson: RelatedPerson | undefined;

  // related-person-types
  public prsTypeEntries: ThesaurusEntry[] | undefined;
  // external-id-scopes
  public scopeEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  public persons: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.persons = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.persons,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: RelatedPersonsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.persons.setValue(model.persons || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: RelatedPersonsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'related-person-types';
    if (this.thesauri && this.thesauri[key]) {
      this.prsTypeEntries = this.thesauri[key].entries;
    } else {
      this.prsTypeEntries = undefined;
    }
    key = 'external-id-scopes';
    if (this.thesauri && this.thesauri[key]) {
      this.scopeEntries = this.thesauri[key].entries;
    } else {
      this.scopeEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.assTagEntries = this.thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.thesauri && this.thesauri[key]) {
      this.refTypeEntries = this.thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.thesauri && this.thesauri[key]) {
      this.refTagEntries = this.thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
  }

  protected getModelFromForm(): RelatedPersonsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: RELATED_PERSONS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        persons: [],
      };
    }
    part.persons = this.persons.value || [];
    return part;
  }

  public addPerson(): void {
    const person: RelatedPerson = {
      type: this.prsTypeEntries?.length ? this.prsTypeEntries[0].id : '',
      name: ''
    };
    this.persons.setValue([...this.persons.value, person]);
    this.persons.updateValueAndValidity();
    this.persons.markAsDirty();
    this.editPerson(this.persons.value.length - 1);
  }

  public editPerson(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedPerson = undefined;
    } else {
      this._editedIndex = index;
      this.editedPerson = this.persons.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onPersonSave(entry: RelatedPerson): void {
    this.persons.setValue(
      this.persons.value.map((e: RelatedPerson, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.persons.updateValueAndValidity();
    this.persons.markAsDirty();
    this.editPerson(-1);
  }

  public onPersonClose(): void {
    this.editPerson(-1);
  }

  public deletePerson(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete entry?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.persons.value];
          entries.splice(index, 1);
          this.persons.setValue(entries);
          this.persons.updateValueAndValidity();
          this.persons.markAsDirty();
        }
      });
  }

  public movePersonUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.persons.value[index];
    const entries = [...this.persons.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.persons.setValue(entries);
    this.persons.updateValueAndValidity();
    this.persons.markAsDirty();
  }

  public movePersonDown(index: number): void {
    if (index + 1 >= this.persons.value.length) {
      return;
    }
    const entry = this.persons.value[index];
    const entries = [...this.persons.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.persons.setValue(entries);
    this.persons.updateValueAndValidity();
    this.persons.markAsDirty();
  }
}
