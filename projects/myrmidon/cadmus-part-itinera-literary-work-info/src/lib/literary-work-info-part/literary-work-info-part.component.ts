import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormField, maxLength, required } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { AssertedTitleComponent } from '../asserted-title/asserted-title.component';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  copyFormValue,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  renderLabelFromLastColon,
  ThesaurusTreeComponent,
} from '@myrmidon/cadmus-thesaurus-store';

import {
  AssertedTitle,
  LiteraryWorkInfoPart,
  LITERARY_WORK_INFO_PART_TYPEID,
} from '../literary-work-info-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface LiteraryWorkInfoPartControls {
  languages: string[];
  genre: string;
  metres: string[];
  strophes: string;
  isLost: boolean;
  authorIds: AssertedCompositeId[];
  titles: AssertedTitle[];
  note: string;
}

function toDraft(
  part?: LiteraryWorkInfoPart | null,
): LiteraryWorkInfoPartControls {
  return {
    languages: [...(part?.languages || [])],
    genre: part?.genre || '',
    metres: [...(part?.metres || [])],
    strophes: part?.strophes?.length ? part.strophes.join('\n') : '',
    isLost: !!part?.isLost,
    authorIds: copyFormValue(part?.authorIds || []),
    titles: copyFormValue(part?.titles || []),
    note: part?.note || '',
  };
}

/**
 * LiteraryWorkInfo part editor component.
 * Thesauri: literary-work-languages, literary-work-genres,
 * literary-work-metres, assertion-tags, doc-reference-types,
 * doc-reference-tags, asserted-id-scopes, asserted-id-tags
 * (all optional).
 */
@Component({
  selector: 'cadmus-literary-work-info-part',
  templateUrl: './literary-work-info-part.component.html',
  styleUrls: ['./literary-work-info-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    AssertedCompositeIdsComponent,
    MatButton,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    AssertedTitleComponent,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    FlagSetComponent,
    ThesaurusTreeComponent,
    MatHint,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class LiteraryWorkInfoPartComponent extends ModelEditorComponentBase<LiteraryWorkInfoPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly editedTitle = signal<AssertedTitle | undefined>(undefined);

  // literary-work-genres
  public readonly genreEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['literary-work-genres']?.entries,
  );
  // literary-work-languages
  public readonly langEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['literary-work-languages']?.entries,
  );
  // literary-work-metres
  public readonly mtrEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['literary-work-metres']?.entries,
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
  // asserted-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
  // asserted-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
  );

  public readonly langFlags = computed<Flag[]>(
    () => this.langEntries()?.map(entryToFlag) || [],
  );
  public readonly mtrFlags = computed<Flag[]>(
    () => this.mtrEntries()?.map(entryToFlag) || [],
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.languages, 1);
    required(p.genre);
    maxLength(p.genre, 100);
    NgxToolsSignalValidators.strictMinLength(p.titles, 1);
    maxLength(p.note, 1000);
  });

  // the label of the genre, when it is picked from its thesaurus
  public readonly pickedGenre = computed<string | undefined>(() => {
    const genre = this.form.genre().value();
    return this.genreEntries()?.find((e) => e.id === genre)?.value;
  });

  private parseStrophes(text: string): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const strophes = [
      ...new Set(
        text
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s),
      ),
    ];
    return strophes.length ? strophes : undefined;
  }

  protected getValue(): LiteraryWorkInfoPart {
    let part = this.getEditedPart(
      LITERARY_WORK_INFO_PART_TYPEID,
    ) as LiteraryWorkInfoPart;
    const draft = this._draft();
    part.languages = [...draft.languages];
    part.genre = draft.genre.trim();
    part.metres = draft.metres.length ? [...draft.metres] : undefined;
    part.strophes = this.parseStrophes(draft.strophes);
    part.isLost = draft.isLost ? true : undefined;
    part.authorIds = draft.authorIds.length
      ? copyFormValue(draft.authorIds)
      : undefined;
    part.titles = copyFormValue(draft.titles);
    part.note = draft.note.trim() || undefined;

    return part;
  }

  public onLanguageIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.languages, [...(ids || [])]);
  }

  public onMetreIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.metres, [...(ids || [])]);
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    this.form.genre().value.set(entry.id);
    this.form.genre().markAsDirty();
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }

  public onAuthorIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.authorIds, copyFormValue(ids || []));
  }

  private setTitles(titles: AssertedTitle[]): void {
    this.form.titles().value.set(titles);
    this.form.titles().markAsDirty();
  }

  //#region Titles
  public addTitle(): void {
    const title: AssertedTitle = {
      language: this.langEntries()?.length ? this.langEntries()![0].id : '',
      value: '',
    };
    this.setTitles([...this.form.titles().value(), title]);
    this.editTitle(this.form.titles().value().length - 1);
  }

  public editTitle(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedTitle.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedTitle.set(copyFormValue(this.form.titles().value()[index]));
    }
  }

  public onTitleSave(item: AssertedTitle): void {
    this.setTitles(
      this.form
        .titles()
        .value()
        .map((x: AssertedTitle, i: number) =>
          i === this.editedIndex() ? item : x,
        ),
    );
    this.editTitle(-1);
  }

  public onTitleClose(): void {
    this.editTitle(-1);
  }

  public deleteTitle(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete title?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const titles = [...this.form.titles().value()];
          titles.splice(index, 1);
          this.setTitles(titles);
          // keep the edited title in sync with the changed list
          if (index === this.editedIndex()) {
            this.editTitle(-1);
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited title in sync after the titles at the
   * specified indexes were swapped.
   */
  private onTitlesSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveTitleUp(index: number): void {
    if (index < 1) {
      return;
    }
    const title = this.form.titles().value()[index];
    const titles = [...this.form.titles().value()];
    titles.splice(index, 1);
    titles.splice(index - 1, 0, title);
    this.setTitles(titles);
    this.onTitlesSwapped(index, index - 1);
  }

  public moveTitleDown(index: number): void {
    if (index + 1 >= this.form.titles().value().length) {
      return;
    }
    const title = this.form.titles().value()[index];
    const titles = [...this.form.titles().value()];
    titles.splice(index, 1);
    titles.splice(index + 1, 0, title);
    this.setTitles(titles);
    this.onTitlesSwapped(index, index + 1);
  }
  //#endregion
}
