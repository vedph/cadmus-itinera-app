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

import {
  NgxToolsSignalValidators,
  FlatLookupPipe,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  RelatedPerson,
  RelatedPersonsPart,
  RELATED_PERSONS_PART_TYPEID,
} from '../related-persons-part';
import { RelatedPersonComponent } from '../related-person/related-person.component';

interface RelatedPersonsPartControls {
  persons: RelatedPerson[];
}

function toDraft(
  part?: RelatedPersonsPart | null,
): RelatedPersonsPartControls {
  return { persons: copyFormValue(part?.persons || []) };
}

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
    RelatedPersonComponent,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
    FlatLookupPipe,
  ],
})
export class RelatedPersonsPartComponent extends ModelEditorComponentBase<RelatedPersonsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedPerson = signal<RelatedPerson | undefined>(undefined);

  // related-person-types
  public readonly prsTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['related-person-types']?.entries,
  );
  // asserted-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
  );
  // asserted-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
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
    NgxToolsSignalValidators.strictMinLength(p.persons, 1);
  });

  protected getValue(): RelatedPersonsPart {
    let part = this.getEditedPart(
      RELATED_PERSONS_PART_TYPEID
    ) as RelatedPersonsPart;
    part.persons = copyFormValue(this._draft().persons);
    return part;
  }

  public addPerson(): void {
    const person: RelatedPerson = {
      type: this.prsTypeEntries()?.length ? this.prsTypeEntries()![0].id : '',
      name: '',
    };
    this.form.persons().value.set([...this.form.persons().value(), person]);
    this.form.persons().markAsDirty();
    this.editPerson(this.form.persons().value().length - 1);
  }

  public editPerson(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedPerson.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedPerson.set(copyFormValue(this.form.persons().value()[index]));
    }
  }

  public onPersonSave(entry: RelatedPerson): void {
    this.form.persons().value.set(
      this.form.persons().value().map((e: RelatedPerson, i: number) =>
        i === this.editedIndex() ? entry : e
      )
    );
    this.form.persons().markAsDirty();
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
          const entries = [...this.form.persons().value()];
          entries.splice(index, 1);
          this.form.persons().value.set(entries);
          this.form.persons().markAsDirty();
          // keep the edited person in sync with the changed list
          if (index === this.editedIndex()) {
            this.editPerson(-1);
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited person in sync after the persons at the
   * specified indexes were swapped.
   */
  private onPersonsSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public movePersonUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.form.persons().value()[index];
    const entries = [...this.form.persons().value()];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.form.persons().value.set(entries);
    this.form.persons().markAsDirty();
    this.onPersonsSwapped(index, index - 1);
  }

  public movePersonDown(index: number): void {
    if (index + 1 >= this.form.persons().value().length) {
      return;
    }
    const entry = this.form.persons().value()[index];
    const entries = [...this.form.persons().value()];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.form.persons().value.set(entries);
    this.form.persons().markAsDirty();
    this.onPersonsSwapped(index, index + 1);
  }
}
