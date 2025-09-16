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

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
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
  PersonWork,
  PersonWorksPart,
  PERSON_WORKS_PART_TYPEID,
} from '../person-works-part';
import { PersonWorkComponent } from '../person-work/person-work.component';

/**
 * PersonWorksPart editor component.
 * Thesauri: assertion-tags, doc-reference-types, doc-reference-tags (all optional).
 */
@Component({
  selector: 'cadmus-person-works-part',
  templateUrl: './person-works-part.component.html',
  styleUrls: ['./person-works-part.component.css'],
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
    PersonWorkComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
  ],
})
export class PersonWorksPartComponent
  extends ModelEditorComponentBase<PersonWorksPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedWork = signal<PersonWork | undefined>(undefined);

  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public works: FormControl<PersonWork[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.works = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
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

  private updateForm(part?: PersonWorksPart | null): void {
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
      this.editedIndex.set(-1);
      this.editedWork.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedWork.set(deepCopy(this.works.value[index]));
    }
  }

  public onWorkSave(work: PersonWork): void {
    this.works.setValue(
      this.works.value.map((e: PersonWork, i: number) =>
        i === this.editedIndex() ? work : e
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
