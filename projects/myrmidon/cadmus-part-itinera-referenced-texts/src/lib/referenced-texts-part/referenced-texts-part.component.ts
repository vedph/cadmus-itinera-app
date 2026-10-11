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
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
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
  ReferencedText,
  ReferencedTextsPart,
  REFERENCED_TEXTS_PART_TYPEID,
} from '../referenced-texts-part';
import { ReferencedTextComponent } from '../referenced-text/referenced-text.component';

interface ReferencedTextsPartControls {
  texts: ReferencedText[];
}

function toDraft(
  part?: ReferencedTextsPart | null,
): ReferencedTextsPartControls {
  return { texts: copyFormValue(part?.texts || []) };
}

/**
 * ReferencedTextsPart editor component.
 * Thesauri: related-text-types, asserted-id-scopes, asserted-id-tags,
 * assertion-tags, doc-reference-types, doc-reference-tags.
 */
@Component({
  selector: 'cadmus-referenced-texts-part',
  templateUrl: './referenced-texts-part.component.html',
  styleUrls: ['./referenced-texts-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    HelpLinkComponent,
    TitleCasePipe,
    FlatLookupPipe,
  ],
})
export class ReferencedTextsPartComponent extends ModelEditorComponentBase<ReferencedTextsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedText = signal<ReferencedText | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  // related-text-types
  public readonly txtTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['related-text-types']?.entries,
  );
  // asserted-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
  // asserted-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
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
    NgxToolsSignalValidators.strictMinLength(p.texts, 1);
  });

  protected getValue(): ReferencedTextsPart {
    let part = this.getEditedPart(
      REFERENCED_TEXTS_PART_TYPEID
    ) as ReferencedTextsPart;
    part.texts = copyFormValue(this._draft().texts);
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
    this.editedText.set(copyFormValue(this.form.texts().value()[index]));
  }

  public onTextSave(text: ReferencedText): void {
    const texts = [...this.form.texts().value()];
    if (this.editedIndex() === -1) {
      texts.push(text);
    } else {
      texts.splice(this.editedIndex(), 1, text);
    }
    this.form.texts().value.set(texts);
    this.form.texts().markAsDirty();
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
          const texts = [...this.form.texts().value()];
          texts.splice(index, 1);
          this.form.texts().value.set(texts);
          this.form.texts().markAsDirty();
          // keep the edited text in sync with the changed list
          if (index === this.editedIndex()) {
            this.closeText();
          } else if (index < this.editedIndex()) {
            this.editedIndex.set(this.editedIndex() - 1);
          }
        }
      });
  }

  /**
   * Keep the index of the edited text in sync after the texts at the
   * specified indexes were swapped.
   */
  private onTextsSwapped(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveTextUp(index: number): void {
    if (index < 1) {
      return;
    }
    const text = this.form.texts().value()[index];
    const texts = [...this.form.texts().value()];
    texts.splice(index, 1);
    texts.splice(index - 1, 0, text);
    this.form.texts().value.set(texts);
    this.form.texts().markAsDirty();
    this.onTextsSwapped(index, index - 1);
  }

  public moveTextDown(index: number): void {
    if (index + 1 >= this.form.texts().value().length) {
      return;
    }
    const text = this.form.texts().value()[index];
    const texts = [...this.form.texts().value()];
    texts.splice(index, 1);
    texts.splice(index + 1, 0, text);
    this.form.texts().value.set(texts);
    this.form.texts().markAsDirty();
    this.onTextsSwapped(index, index + 1);
  }
}
