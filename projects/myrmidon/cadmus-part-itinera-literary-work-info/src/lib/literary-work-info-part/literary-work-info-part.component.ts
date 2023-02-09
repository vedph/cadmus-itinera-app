import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  ModelEditorComponentBase,
  renderLabelFromLastColon,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  AssertedTitle,
  LiteraryWorkInfoPart,
  LITERARY_WORK_INFO_PART_TYPEID,
} from '../literary-work-info-part';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { AssertedId } from '@myrmidon/cadmus-refs-asserted-ids';

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
})
export class LiteraryWorkInfoPartComponent
  extends ModelEditorComponentBase<LiteraryWorkInfoPart>
  implements OnInit
{
  private _editedIndex;

  public editedTitle: AssertedTitle | undefined;

  public languages: FormControl<string[]>;
  public genre: FormControl<string | null>;
  public metres: FormControl<string[]>;
  public strophes: FormControl<string | null>;
  public isLost: FormControl<boolean>;
  public authorIds: FormControl<AssertedId[]>;
  public titles: FormControl<AssertedTitle[]>;
  public note: FormControl<string | null>;

  public langFlags: Flag[];
  public mtrFlags: Flag[];

  public pickedGenre?: string;

  // literary-work-languages
  public langEntries: ThesaurusEntry[] | undefined;
  // literary-work-genres
  public genreEntries: ThesaurusEntry[] | undefined;
  // literary-work-metres
  public mtrEntries: ThesaurusEntry[] | undefined;
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

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.langFlags = [];
    this.mtrFlags = [];
    this._editedIndex = -1;
    // form
    this.languages = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
      validators: NgToolsValidators.strictMinLengthValidator(1),
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

    this.langFlags = this.entriesToFlags(this.langEntries);
    this.mtrFlags = this.entriesToFlags(this.mtrEntries);
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

  private entriesToFlags(entries: ThesaurusEntry[] | undefined): Flag[] {
    return entries?.length
      ? entries.map((e) => {
          return {
            id: e.id,
            label: e.value,
          } as Flag;
        })
      : [];
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

  public onLanguagesChange(ids: string[]): void {
    this.languages.setValue(ids);
    this.languages.updateValueAndValidity();
    this.languages.markAsDirty();
  }

  public onMetresChange(ids: string[]): void {
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

  public onAuthorIdsChange(ids: AssertedId[]): void {
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
