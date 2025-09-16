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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators, FlatLookupPipe, deepCopy } from '@myrmidon/ngx-tools';
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
  RelatedPerson,
  RelatedPersonsPart,
  RELATED_PERSONS_PART_TYPEID,
} from '../related-persons-part';
import { RelatedPersonComponent } from '../related-person/related-person.component';

/**
 * RelatedPersonsPart editor component.
 * Thesauri: related-person-types, assertion-tags, doc-reference-types,
 * doc-reference-tags, asserted-id-tags, asserted-id-scopes
 * (all optional).
 */
@Component({
  selector: 'cadmus-related-persons-part',
  templateUrl: './related-persons-part.component.html',
  styleUrls: ['./related-persons-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatExpansionModule,
    MatButton,
    MatIconButton,
    MatTooltip,
    RelatedPersonComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    FlatLookupPipe,
  ],
})
export class RelatedPersonsPartComponent
  extends ModelEditorComponentBase<RelatedPersonsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedPerson = signal<RelatedPerson | undefined>(undefined);

  // related-person-types
  public readonly prsTypeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // asserted-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // asserted-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public persons: FormControl<RelatedPerson[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.persons = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
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

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
    key = 'related-person-types';
    if (this.hasThesaurus(key)) {
      this.prsTypeEntries.set(thesauri[key].entries);
    } else {
      this.prsTypeEntries.set(undefined);
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }
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
      type: this.prsTypeEntries()?.length ? this.prsTypeEntries()![0].id : '',
      name: '',
    };
    this.persons.setValue([...this.persons.value, person]);
    this.persons.updateValueAndValidity();
    this.persons.markAsDirty();
    this.editPerson(this.persons.value.length - 1);
  }

  public editPerson(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedPerson.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedPerson.set(deepCopy(this.persons.value[index]));
    }
  }

  public onPersonSave(entry: RelatedPerson): void {
    this.persons.setValue(
      this.persons.value.map((e: RelatedPerson, i: number) =>
        i === this.editedIndex() ? entry : e
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
