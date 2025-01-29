import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  ModelEditorComponentBase,
  renderLabelFromLastColon,
  ThesaurusTreeComponent,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
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
 * doc-reference-tags, asserted-id-scopes, asserted-id-tags,
 * pin-link-settings (all optional).
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
    CloseSaveButtonsComponent,
  ],
})
export class LiteraryWorkInfoPartComponent
  extends ModelEditorComponentBase<LiteraryWorkInfoPart>
  implements OnInit
{
  private _editedIndex;
  private _langEntries: ThesaurusEntry[];
  private _mtrEntries: ThesaurusEntry[];

  public editedTitle: AssertedTitle | undefined;

  public languages: FormControl<string[]>;
  public genre: FormControl<string | null>;
  public metres: FormControl<string[]>;
  public strophes: FormControl<string | null>;
  public isLost: FormControl<boolean>;
  public authorIds: FormControl<AssertedCompositeId[]>;
  public titles: FormControl<AssertedTitle[]>;
  public note: FormControl<string | null>;

  public langFlags: Flag[] = [];
  public mtrFlags: Flag[] = [];

  public pickedGenre?: string;

  // literary-work-genres
  public genreEntries: ThesaurusEntry[] | undefined;
  // literary-work-languages
  public get langEntries(): ThesaurusEntry[] | undefined {
    return this._langEntries;
  }
  public set langEntries(value: ThesaurusEntry[] | undefined) {
    if (this._langEntries === value) {
      return;
    }
    this._langEntries = value || [];
    this.langFlags = this._langEntries.map(entryToFlag);
  }
  // literary-work-metres
  public get mtrEntries(): ThesaurusEntry[] | undefined {
    return this._mtrEntries;
  }
  public set mtrEntries(value: ThesaurusEntry[] | undefined) {
    if (this._mtrEntries === value) {
      return;
    }
    this._mtrEntries = value || [];
    this.mtrFlags = this._mtrEntries.map(entryToFlag);
  }

  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;
  // asserted-id-scopes
  public idScopeEntries?: ThesaurusEntry[] | undefined;
  // asserted-id-tags
  public idTagEntries?: ThesaurusEntry[] | undefined;
  // settings
  // by-type: true/false
  public pinByTypeMode?: boolean;
  // switch-mode: true/false
  public canSwitchMode?: boolean;
  // edit-target: true/false
  public canEditTarget?: boolean;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // flags
    this._langEntries = [];
    this._mtrEntries = [];
    this._editedIndex = -1;
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
    let key = 'literary-work-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries = thesauri[key].entries;
    } else {
      this.langEntries = undefined;
    }
    key = 'literary-work-genres';
    if (this.hasThesaurus(key)) {
      this.genreEntries = thesauri[key].entries;
    } else {
      this.genreEntries = undefined;
    }
    key = 'literary-work-metres';
    if (this.hasThesaurus(key)) {
      this.mtrEntries = thesauri[key].entries;
    } else {
      this.mtrEntries = undefined;
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
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries = thesauri[key].entries;
    } else {
      this.idTagEntries = undefined;
    }
    // load settings from thesaurus
    this.loadSettings(thesauri['pin-link-settings']?.entries);
  }

  private updateForm(part?: LiteraryWorkInfoPart | null): void {
    if (!part) {
      this.form.reset();
      this.pickedGenre = undefined;
      return;
    }
    this.languages.setValue(part.languages || []);
    this.genre.setValue(part.genre);
    this.pickedGenre = this.genreEntries?.find(
      (e) => e.id === part.genre
    )?.value;
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
    this.pickedGenre = entry.value;
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
      language: this.langEntries?.length ? this.langEntries[0].id : '',
      value: '',
    };
    this.titles.setValue([...this.titles.value, title]);
    this.titles.updateValueAndValidity();
    this.titles.markAsDirty();
    this.editTitle(this.titles.value.length - 1);
  }

  public editTitle(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.editedTitle = undefined;
    } else {
      this._editedIndex = index;
      this.editedTitle = this.titles.value[index];
    }
  }

  public onTitleSave(item: AssertedTitle): void {
    this.titles.setValue(
      this.titles.value.map((x: AssertedTitle, i: number) =>
        i === this._editedIndex ? item : x
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
