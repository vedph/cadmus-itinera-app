import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

import { deepCopy, NgToolsValidators } from '@myrmidon/ng-tools';
import { DialogService } from '@myrmidon/ng-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  ReferencedText,
  ReferencedTextsPart,
  REFERENCED_TEXTS_PART_TYPEID,
} from '../referenced-texts-part';

/**
 * ReferencedTextsPart editor component.
 * Thesauri: related-text-types, assertion-tags, doc-reference-types,
 * doc-reference-tags.
 */
@Component({
  selector: 'cadmus-referenced-texts-part',
  templateUrl: './referenced-texts-part.component.html',
  styleUrls: ['./referenced-texts-part.component.css'],
})
export class ReferencedTextsPartComponent
  extends ModelEditorComponentBase<ReferencedTextsPart>
  implements OnInit
{
  private _editedIndex: number;

  public tabIndex: number;
  public editedText: ReferencedText | undefined;

  // related-text-types
  public txtTypeEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  public texts: FormControl<ReferencedText[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.texts = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.form = formBuilder.group({
      entries: this.texts,
    });
  }

  public ngOnInit(): void {
    this.initEditor();
  }

  private updateForm(model: ReferencedTextsPart): void {
    if (!model) {
      this.form!.reset();
      return;
    }
    this.texts.setValue(model.texts || []);
    this.form!.markAsPristine();
  }

  protected onModelSet(model: ReferencedTextsPart): void {
    this.updateForm(deepCopy(model));
  }

  protected override onThesauriSet(): void {
    let key = 'related-text-types';
    if (this.thesauri && this.thesauri[key]) {
      this.txtTypeEntries = this.thesauri[key].entries;
    } else {
      this.txtTypeEntries = undefined;
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
  }

  protected getModelFromForm(): ReferencedTextsPart {
    let part = this.model;
    if (!part) {
      part = {
        itemId: this.itemId || '',
        id: '',
        typeId: REFERENCED_TEXTS_PART_TYPEID,
        roleId: this.roleId,
        timeCreated: new Date(),
        creatorId: '',
        timeModified: new Date(),
        userId: '',
        texts: [],
      };
    }
    part.texts = this.texts.value || [];
    return part;
  }

  public addText(): void {
    const text: ReferencedText = {
      type: this.txtTypeEntries?.length ? this.txtTypeEntries[0].id : '',
      targetId: '',
    };
    this.texts.setValue([...this.texts.value, text]);
    this.texts.updateValueAndValidity();
    this.editText(this.texts.value.length - 1);
  }

  public editText(index: number): void {
    if (index < 0) {
      this._editedIndex = -1;
      this.tabIndex = 0;
      this.editedText = undefined;
    } else {
      this._editedIndex = index;
      this.editedText = this.texts.value[index];
      setTimeout(() => {
        this.tabIndex = 1;
      }, 300);
    }
  }

  public onTextSave(entry: ReferencedText): void {
    this.texts.setValue(
      this.texts.value.map((e: ReferencedText, i: number) =>
        i === this._editedIndex ? entry : e
      )
    );
    this.texts.updateValueAndValidity();
    this.texts.markAsDirty();
    this.editText(-1);
  }

  public onTextClose(): void {
    this.editText(-1);
  }

  public deleteText(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete text?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const texts = [...this.texts.value];
          texts.splice(index, 1);
          this.texts.setValue(texts);
          this.texts.updateValueAndValidity();
          this.texts.markAsDirty();
        }
      });
  }

  public moveTextUp(index: number): void {
    if (index < 1) {
      return;
    }
    const text = this.texts.value[index];
    const texts = [...this.texts.value];
    texts.splice(index, 1);
    texts.splice(index - 1, 0, text);
    this.texts.setValue(texts);
    this.texts.updateValueAndValidity();
    this.texts.markAsDirty();
  }

  public moveTextDown(index: number): void {
    if (index + 1 >= this.texts.value.length) {
      return;
    }
    const text = this.texts.value[index];
    const texts = [...this.texts.value];
    texts.splice(index, 1);
    texts.splice(index + 1, 0, text);
    this.texts.setValue(texts);
    this.texts.updateValueAndValidity();
    this.texts.markAsDirty();
  }
}
