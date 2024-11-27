import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  RelatedPerson,
  RelatedPersonsPart,
  RELATED_PERSONS_PART_TYPEID,
} from '../related-persons-part';

/**
 * RelatedPersonsPart editor component.
 * Thesauri: related-person-types, assertion-tags, doc-reference-types,
 * doc-reference-tags, asserted-id-tags, asserted-id-scopes,
 * pin-link-settings (all optional).
 */
@Component({
  selector: 'cadmus-related-persons-part',
  templateUrl: './related-persons-part.component.html',
  styleUrls: ['./related-persons-part.component.css'],
  standalone: false,
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
  // asserted-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // asserted-id-scopes
  public idScopeEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // settings
  // by-type: true/false
  public pinByTypeMode?: boolean;
  // switch-mode: true/false
  public canSwitchMode?: boolean;
  // edit-target: true/false
  public canEditTarget?: boolean;

  public persons: FormControl<RelatedPerson[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.persons = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.persons,
    });
  }

  /**
   * Load settings from thesaurus entries.
   *
   * @param entries The thesaurus entries if any.
   */
  private loadSettings(entries?: ThesaurusEntry[]): void {
    if (!entries?.length) {
      this.pinByTypeMode = undefined;
      this.canSwitchMode = undefined;
      this.canEditTarget = undefined;
    }
    this.pinByTypeMode =
      entries?.find((e) => e.id === 'by-type')?.value === 'true';
    this.canSwitchMode =
      entries?.find((e) => e.id === 'switch-mode')?.value === 'true';
    this.canEditTarget =
      entries?.find((e) => e.id === 'edit-target')?.value === 'true';
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries = thesauri[key].entries;
    } else {
      this.idTagEntries = undefined;
    }
    key = 'related-person-types';
    if (this.hasThesaurus(key)) {
      this.prsTypeEntries = thesauri[key].entries;
    } else {
      this.prsTypeEntries = undefined;
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries = thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries = thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
    // load settings from thesaurus
    this.loadSettings(thesauri['pin-link-settings']?.entries);
  }

  private updateForm(part?: RelatedPersonsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.persons.setValue(part.persons || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<RelatedPersonsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): RelatedPersonsPart {
    let part = this.getEditedPart(
      RELATED_PERSONS_PART_TYPEID
    ) as RelatedPersonsPart;
    part.persons = this.persons.value || [];
    return part;
  }

  public addPerson(): void {
    const person: RelatedPerson = {
      type: this.prsTypeEntries?.length ? this.prsTypeEntries[0].id : '',
      name: '',
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
