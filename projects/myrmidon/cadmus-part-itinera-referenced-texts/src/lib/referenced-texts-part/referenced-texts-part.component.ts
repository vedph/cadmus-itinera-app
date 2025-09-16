import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';

import {
  NgxToolsValidators,
  FlatLookupPipe,
  deepCopy,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';

import {
  ReferencedText,
  ReferencedTextsPart,
  REFERENCED_TEXTS_PART_TYPEID,
} from '../referenced-texts-part';
import { ReferencedTextComponent } from '../referenced-text/referenced-text.component';

/**
 * ReferencedTextsPart editor component.
 * Thesauri: related-text-types, asserted-id-scopes, asserted-id-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags.
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
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatButton,
    MatIconButton,
    MatTooltip,
    ReferencedTextComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    TitleCasePipe,
    FlatLookupPipe,
  ],
})
export class ReferencedTextsPartComponent
  extends ModelEditorComponentBase<ReferencedTextsPart>
  implements OnInit
{
  public readonly editedText = signal<ReferencedText | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  // related-text-types
  public readonly txtTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
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

  public texts: FormControl<ReferencedText[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
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

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'related-text-types';
    if (this.hasThesaurus(key)) {
      this.txtTypeEntries.set(thesauri[key].entries);
    } else {
      this.txtTypeEntries.set(undefined);
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
    this.editedIndex.set(-1);
    this.editedText.set({
      type: this.txtTypeEntries()?.length ? this.txtTypeEntries()![0].id : '',
      targetId: { target: { gid: '', label: '' } },
    });
  }

  public editText(index: number): void {
    this.editedIndex.set(index);
    this.editedText.set(deepCopy(this.texts.value[index]));
  }

  public onTextSave(text: ReferencedText): void {
    const texts = [...this.texts.value];
    if (this.editedIndex() === -1) {
      texts.push(text);
    } else {
      texts.splice(this.editedIndex(), 1, text);
    }
    this.texts.setValue(texts);
    this.texts.updateValueAndValidity();
    this.texts.markAsDirty();
    this.closeText();
  }

  public closeText(): void {
    this.editedIndex.set(-1);
    this.editedText.set(undefined);
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
