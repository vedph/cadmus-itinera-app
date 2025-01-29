import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { NgxToolsValidators, FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  ReferencedText,
  ReferencedTextsPart,
  REFERENCED_TEXTS_PART_TYPEID,
} from '../referenced-texts-part';
import { ReferencedTextComponent } from '../referenced-text/referenced-text.component';

/**
 * ReferencedTextsPart editor component.
 * Thesauri: related-text-types, asserted-id-scopes, asserted-id-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags,
 * pin-link-settings.
 */
@Component({
  selector: 'cadmus-referenced-texts-part',
  templateUrl: './referenced-texts-part.component.html',
  styleUrls: ['./referenced-texts-part.component.css'],
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
    MatButton,
    MatIconButton,
    MatTooltip,
    ReferencedTextComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    FlatLookupPipe,
  ],
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
  public idScopeEntries: ThesaurusEntry[] | undefined;
  // asserted-id-tags
  public idTagEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  public refTagEntries: ThesaurusEntry[] | undefined;

  // pin link settings
  // by-type: true/false
  public pinByTypeMode?: boolean;
  // switch-mode: true/false
  public canSwitchMode?: boolean;
  // edit-target: true/false
  public canEditTarget?: boolean;

  public texts: FormControl<ReferencedText[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this._editedIndex = -1;
    this.tabIndex = 0;
    // form
    this.texts = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.texts,
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
    let key = 'related-text-types';
    if (this.hasThesaurus(key)) {
      this.txtTypeEntries = thesauri[key].entries;
    } else {
      this.txtTypeEntries = undefined;
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
    // load settings from thesaurus
    this.loadSettings(thesauri['pin-link-settings']?.entries);
  }

  private updateForm(part?: ReferencedTextsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.texts.setValue(part.texts || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<ReferencedTextsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): ReferencedTextsPart {
    let part = this.getEditedPart(
      REFERENCED_TEXTS_PART_TYPEID
    ) as ReferencedTextsPart;
    part.texts = this.texts.value || [];
    return part;
  }

  public addText(): void {
    this.editText(
      {
        type: this.txtTypeEntries?.length ? this.txtTypeEntries[0].id : '',
        targetId: { target: { gid: '', label: '' } },
      },
      -1
    );
  }

  public editText(text: ReferencedText, index: number): void {
    this._editedIndex = index;
    this.editedText = text;
    setTimeout(() => {
      this.tabIndex = 1;
    }, 0);
  }

  public onTextSave(text: ReferencedText): void {
    const texts = [...this.texts.value];
    if (this._editedIndex === -1) {
      texts.push(text);
    } else {
      texts.splice(this._editedIndex, 1, text);
    }
    this.texts.setValue(texts);
    this.texts.updateValueAndValidity();
    this.texts.markAsDirty();
    this.closeText();
  }

  public closeText(): void {
    this._editedIndex = -1;
    this.editedText = undefined;
    this.tabIndex = 0;
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
