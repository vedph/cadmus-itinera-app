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
  PersonWork,
  PersonWorksPart,
  PERSON_WORKS_PART_TYPEID,
} from '../person-works-part';

/**
 * PersonWorksPart editor component.
 * Thesauri: assertion-tags, doc-reference-types, doc-reference-tags (all optional).
 */
@Component({
  selector: 'cadmus-person-works-part',
  templateUrl: './person-works-part.component.html',
  styleUrls: ['./person-works-part.component.css'],
})
export class PersonWorksPartComponent
  extends ModelEditorComponentBase<PersonWorksPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedWork: PersonWork | undefined;

  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  public works: FormControl<PersonWork[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.works = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.works,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'assertion-tags';
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
  }

  private updateForm(part?: PersonWorksPart): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.works.setValue(part.works || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<PersonWorksPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): PersonWorksPart {
    let part = this.getEditedPart(PERSON_WORKS_PART_TYPEID) as PersonWorksPart;
    part.works = this.works.value || [];
    return part;
  }

  public addWork(): void {
    const work: PersonWork = {
      title: '',
    };
    this.works.setValue([...this.works.value, work]);
    this.works.updateValueAndValidity();
    this.works.markAsDirty();
    this.editWork(this.works.value.length - 1);
  }

  public editWork(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedWork = undefined;
    } else {
      this._editedIndex = index;
      this.editedWork = this.works.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onWorkSave(work: PersonWork): void {
    this.works.setValue(
      this.works.value.map((e: PersonWork, i: number) =>
        i === this._editedIndex ? work : e
      )
    );
    this.works.updateValueAndValidity();
    this.works.markAsDirty();
    this.editWork(-1);
  }

  public onWorkClose(): void {
    this.editWork(-1);
  }

  public deleteWork(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete work?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const works = [...this.works.value];
          works.splice(index, 1);
          this.works.setValue(works);
          this.works.updateValueAndValidity();
          this.works.markAsDirty();
        }
      });
  }

  public moveWorkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const work = this.works.value[index];
    const works = [...this.works.value];
    works.splice(index, 1);
    works.splice(index - 1, 0, work);
    this.works.setValue(works);
    this.works.updateValueAndValidity();
    this.works.markAsDirty();
  }

  public moveWorkDown(index: number): void {
    if (index + 1 >= this.works.value.length) {
      return;
    }
    const work = this.works.value[index];
    const works = [...this.works.value];
    works.splice(index, 1);
    works.splice(index + 1, 0, work);
    this.works.setValue(works);
    this.works.updateValueAndValidity();
    this.works.markAsDirty();
  }
}
