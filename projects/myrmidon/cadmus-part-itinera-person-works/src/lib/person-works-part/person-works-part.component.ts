import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  PersonWork,
  PersonWorksPart,
  PERSON_WORKS_PART_TYPEID,
} from '../person-works-part';
import { PersonWorkComponent } from '../person-work/person-work.component';

interface PersonWorksPartControls {
  works: PersonWork[];
}

function toDraft(part?: PersonWorksPart | null): PersonWorksPartControls {
  return { works: copyFormValue(part?.works || []) };
}

/**
 * PersonWorksPart editor component.
 * Thesauri: assertion-tags, doc-reference-types, doc-reference-tags (all optional).
 */
@Component({
  selector: 'cadmus-person-works-part',
  templateUrl: './person-works-part.component.html',
  styleUrls: ['./person-works-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    HelpLinkComponent,
  ],
})
export class PersonWorksPartComponent extends ModelEditorComponentBase<PersonWorksPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedWork = signal<PersonWork | undefined>(undefined);

  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.works, 1);
  });

  protected getValue(): PersonWorksPart {
    let part = this.getEditedPart(PERSON_WORKS_PART_TYPEID) as PersonWorksPart;
    part.works = copyFormValue(this._draft().works);
    return part;
  }

  public addWork(): void {
    const work: PersonWork = {
      title: '',
    };
    this.form.works().value.set([...this.form.works().value(), work]);
    this.form.works().markAsDirty();
    this.editWork(this.form.works().value().length - 1);
  }

  public editWork(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedWork.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedWork.set(copyFormValue(this.form.works().value()[index]));
    }
  }

  public onWorkSave(work: PersonWork): void {
    this.form.works().value.set(
      this.form.works().value().map((e: PersonWork, i: number) =>
        i === this.editedIndex() ? work : e
      )
    );
    this.form.works().markAsDirty();
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
          const works = [...this.form.works().value()];
          works.splice(index, 1);
          this.form.works().value.set(works);
          this.form.works().markAsDirty();
          // keep the edited work in sync with the changed list
          if (index === this.editedIndex()) {
            this.editWork(-1);
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited work in sync after the works at the
   * specified indexes were swapped.
   */
  private onWorksSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveWorkUp(index: number): void {
    if (index < 1) {
      return;
    }
    const work = this.form.works().value()[index];
    const works = [...this.form.works().value()];
    works.splice(index, 1);
    works.splice(index - 1, 0, work);
    this.form.works().value.set(works);
    this.form.works().markAsDirty();
    this.onWorksSwapped(index, index - 1);
  }

  public moveWorkDown(index: number): void {
    if (index + 1 >= this.form.works().value().length) {
      return;
    }
    const work = this.form.works().value()[index];
    const works = [...this.form.works().value()];
    works.splice(index, 1);
    works.splice(index + 1, 0, work);
    this.form.works().value.set(works);
    this.form.works().markAsDirty();
    this.onWorksSwapped(index, index + 1);
  }
}
