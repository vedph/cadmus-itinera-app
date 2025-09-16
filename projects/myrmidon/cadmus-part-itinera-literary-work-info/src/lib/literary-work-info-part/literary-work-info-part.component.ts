import { Component, computed, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ModelEditorComponentBase,
  renderLabelFromLastColon,
  ThesaurusTreeComponent,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

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
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class LiteraryWorkInfoPartComponent
  extends ModelEditorComponentBase<LiteraryWorkInfoPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly editedTitle = signal<AssertedTitle | undefined>(undefined);
  public readonly pickedGenre = signal<string | undefined>(undefined);

  // literary-work-genres
  public readonly genreEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  public readonly langEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // literary-work-metres
  public readonly mtrEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  public readonly langFlags = computed<Flag[]>(
    () => this.langEntries()?.map(entryToFlag) || []
  );
  public readonly mtrFlags = computed<Flag[]>(
    () => this.mtrEntries()?.map(entryToFlag) || []
  );

  public languages: FormControl<string[]>;
  public genre: FormControl<string | null>;
  public metres: FormControl<string[]>;
  public strophes: FormControl<string | null>;
  public isLost: FormControl<boolean>;
  public authorIds: FormControl<AssertedCompositeId[]>;
  public titles: FormControl<AssertedTitle[]>;
  public note: FormControl<string | null>;

  // literary-work-languages
  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.languages = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.genre = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.metres = formBuilder.control([], { nonNullable: true });
    this.strophes = formBuilder.control(null);
    this.isLost = formBuilder.control(false, { nonNullable: true });
    this.authorIds = formBuilder.control([], { nonNullable: true });
    this.titles = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      languages: this.languages,
      genre: this.genre,
      metres: this.metres,
      strophes: this.strophes,
      isLost: this.isLost,
      author: this.authorIds,
      titles: this.titles,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'literary-work-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries.set(thesauri[key].entries);
    } else {
      this.langEntries.set(undefined);
    }
    key = 'literary-work-genres';
    if (this.hasThesaurus(key)) {
      this.genreEntries.set(thesauri[key].entries);
    } else {
      this.genreEntries.set(undefined);
    }
    key = 'literary-work-metres';
    if (this.hasThesaurus(key)) {
      this.mtrEntries.set(thesauri[key].entries);
    } else {
      this.mtrEntries.set(undefined);
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
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
  }

  private updateForm(part?: LiteraryWorkInfoPart | null): void {
    if (!part) {
      this.form.reset();
      this.pickedGenre.set(undefined);
      return;
    }
    this.languages.setValue(part.languages || []);
    this.genre.setValue(part.genre);
    this.pickedGenre.set(
      this.genreEntries()?.find((e) => e.id === part.genre)?.value
    );
    this.metres.setValue(part.metres || []);
    this.strophes.setValue(
      part.strophes?.length ? part.strophes.join('\n') : ''
    );
    this.isLost.setValue(part.isLost ? true : false);
    this.authorIds.setValue(part.authorIds || []);
    this.titles.setValue(part.titles || []);
    this.note.setValue(part.note || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<LiteraryWorkInfoPart>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  private parseStrophes(text: string | null): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const strophes = [
      ...new Set(
        text
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s)
      ),
    ];
    return strophes.length ? strophes : undefined;
  }

  protected getValue(): LiteraryWorkInfoPart {
    let part = this.getEditedPart(
      LITERARY_WORK_INFO_PART_TYPEID
    ) as LiteraryWorkInfoPart;
    part.languages = this.languages.value || [];
    part.genre = this.genre.value?.trim() || '';
    part.metres = this.metres.value?.length ? this.metres.value : undefined;
    part.strophes = this.parseStrophes(this.strophes.value);
    part.isLost = this.isLost.value ? true : undefined;
    part.authorIds = this.authorIds.value.length
      ? this.authorIds.value
      : undefined;
    part.titles = this.titles.value || [];
    part.note = this.note.value?.trim();

    return part;
  }

  public onLanguageIdsChange(ids: string[]): void {
    this.languages.setValue(ids);
    this.languages.updateValueAndValidity();
    this.languages.markAsDirty();
  }

  public onMetreIdsChange(ids: string[]): void {
    this.metres.setValue(ids);
    this.metres.updateValueAndValidity();
    this.metres.markAsDirty();
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    this.genre.setValue(entry.id);
    this.genre.updateValueAndValidity();
    this.genre.markAsDirty();
    this.pickedGenre.set(entry.value);
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }

  public onAuthorIdsChange(ids: AssertedCompositeId[]): void {
    this.authorIds.setValue(ids);
    this.authorIds.updateValueAndValidity();
    this.authorIds.markAsDirty();
  }

  //#region Titles
  public addTitle(): void {
    const title: AssertedTitle = {
      language: this.langEntries()?.length ? this.langEntries()![0].id : '',
      value: '',
    };
    this.titles.setValue([...this.titles.value, title]);
    this.titles.updateValueAndValidity();
    this.titles.markAsDirty();
    this.editTitle(this.titles.value.length - 1);
  }

  public editTitle(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.editedTitle.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedTitle.set(deepCopy(this.titles.value[index]));
    }
  }

  public onTitleSave(item: AssertedTitle): void {
    this.titles.setValue(
      this.titles.value.map((x: AssertedTitle, i: number) =>
        i === this.editedIndex() ? item : x
      )
    );
    this.titles.updateValueAndValidity();
    this.titles.markAsDirty();
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
          const titles = [...this.titles.value];
          titles.splice(index, 1);
          this.titles.setValue(titles);
          this.titles.updateValueAndValidity();
          this.titles.markAsDirty();
        }
      });
  }

  public moveTitleUp(index: number): void {
    if (index < 1) {
      return;
    }
    const title = this.titles.value[index];
    const titles = [...this.titles.value];
    titles.splice(index, 1);
    titles.splice(index - 1, 0, title);
    this.titles.setValue(titles);
    this.titles.updateValueAndValidity();
    this.titles.markAsDirty();
  }

  public moveTitleDown(index: number): void {
    if (index + 1 >= this.titles.value.length) {
      return;
    }
    const title = this.titles.value[index];
    const titles = [...this.titles.value];
    titles.splice(index, 1);
    titles.splice(index + 1, 0, title);
    this.titles.setValue(titles);
    this.titles.updateValueAndValidity();
    this.titles.markAsDirty();
  }
  //#endregion
}
