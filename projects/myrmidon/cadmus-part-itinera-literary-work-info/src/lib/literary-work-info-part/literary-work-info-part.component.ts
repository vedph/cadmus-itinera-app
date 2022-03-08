import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase, renderLabelFromLastColon } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  AssertedTitle,
  LiteraryWorkInfoPart,
  LITERARY_WORK_INFO_PART_TYPEID,
} from '../literary-work-info-part';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';

/**
 * LiteraryWorkInfo part editor component.
 * Thesauri: literary-work-languages, literary-work-genres,
 * literary-work-metres, assertion-tags, doc-reference-types,
 * doc-reference-tags (all optional).
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

  public languages: FormControl;
  public genre: FormControl;
  public metres: FormControl;
  public strophes: FormControl;
  public isLost: FormControl;
  public titles: FormControl;
  public note: FormControl;

  public langFlags: Flag[];
  public initialLanguages: string[];
  public mtrFlags: Flag[];
  public initialMetres: string[];

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

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this.langFlags = [];
    this.initialLanguages = [];
    this.mtrFlags = [];
    this.initialMetres = [];
    this._editedIndex = -1;
    // form
    this.languages = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.genre = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.metres = formBuilder.control([]);
    this.strophes = formBuilder.control(null);
    this.isLost = formBuilder.control(false);
    this.titles = formBuilder.control(
      [],
      NgToolsValidators.strictMinLengthValidator(1)
    );
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      languages: this.languages,
      genre: this.genre,
      metres: this.metres,
      strophes: this.strophes,
      isLost: this.isLost,
      titles: this.titles,
      note: this.note,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: LiteraryWorkInfoPart): void {
    if (!model) {
      this.form!.reset();
      this.pickedGenre = undefined;
      return;
    }
    this.initialLanguages = model.languages || [];
    this.genre.setValue(model.genre);
    this.pickedGenre = this.genreEntries?.find(e => e.id === model.genre)?.value;
    this.initialMetres = model.metres || [];
    this.strophes.setValue(
      model.strophes?.length ? model.strophes.join('\n') : ''
    );
    this.isLost.setValue(model.isLost ? true : false);
    this.titles.setValue(model.titles || []);
    this.note.setValue(model.note);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: LiteraryWorkInfoPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'literary-work-languages';
    if (this.thesauri && this.thesauri[key]) {
      this.langEntries = this.thesauri[key].entries;
    } else {
      this.langEntries = undefined;
    }
    key = 'literary-work-genres';
    if (this.thesauri && this.thesauri[key]) {
      this.genreEntries = this.thesauri[key].entries;
    } else {
      this.genreEntries = undefined;
    }
    key = 'literary-work-metres';
    if (this.thesauri && this.thesauri[key]) {
      this.mtrEntries = this.thesauri[key].entries;
    } else {
      this.mtrEntries = undefined;
    }
    key = 'assertion-tags';
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

    this.langFlags = this.entriesToFlags(this.langEntries);
    this.mtrFlags = this.entriesToFlags(this.mtrEntries);
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

  private parseStrophes(text: string): string[] | undefined {
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

  protected getModelFromForm(): LiteraryWorkInfoPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: LITERARY_WORK_INFO_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        languages: [],
        genre: '',
        titles: [],
      };
    }
    part.languages = this.languages.value || [];
    part.genre = this.genre.value?.trim();
    part.metres = this.metres.value?.length ? this.metres.value : undefined;
    part.strophes = this.parseStrophes(this.strophes.value);
    part.isLost = this.isLost.value ? true : undefined;
    part.titles = this.titles.value || [];
    part.note = this.note.value?.trim();

    return part;
  }

  public onLanguagesChange(ids: string[]): void {
    this.languages.setValue(ids);
    this.languages.markAsDirty();
  }

  public onMetresChange(ids: string[]): void {
    this.metres.setValue(ids);
    this.metres.markAsDirty();
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    this.genre.setValue(entry.id);
    this.pickedGenre = entry.value;
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }

  //#region Titles
  public addTitle(): void {
    const title: AssertedTitle = {
      language: this.langEntries?.length ? this.langEntries[0].id : '',
      value: '',
    };
    this.titles.setValue([...this.titles.value, title]);
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
    this.titles.markAsDirty();
  }
  //#endregion
}
