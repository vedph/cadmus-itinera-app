import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
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

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService);
    this.langFlags = [];
    this.initialLanguages = [];
    this.mtrFlags = [];
    this.initialMetres = [];
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
      return;
    }
    this.initialLanguages = model.languages || [];
    this.genre.setValue(model.genre);
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

  public onLangFlagsChange(ids: string[]): void {
    this.languages.setValue(ids);
    this.languages.markAsDirty();
  }

  public onMtrFlagsChange(ids: string[]): void {
    this.metres.setValue(ids);
    this.metres.markAsDirty();
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    this.genre.setValue(entry.id);
  }
}
