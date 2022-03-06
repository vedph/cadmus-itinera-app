import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

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

  public works: FormControl;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.works = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.form = formBuilder.group({
      entries: this.works,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: PersonWorksPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.works.setValue(model.works || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: PersonWorksPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'assertion-tags';
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

  protected getModelFromForm(): PersonWorksPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: PERSON_WORKS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        works: [],
      };
    }
    part.works = this.works.value || [];
    return part;
  }

  public addWork(): void {
    const work: PersonWork = {
      title: '',
    };
    this.works.setValue([...this.works.value, work]);
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
    this.works.markAsDirty();
  }
}
