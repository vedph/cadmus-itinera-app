import {
  ChangeDetectionStrategy,
  Component,
  linkedSignal,
} from '@angular/core';
import { FormField, maxLength } from '@angular/forms/signals';
import { TitleCasePipe } from '@angular/common';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
  HelpLinkComponent,
} from '@myrmidon/cadmus-ui';

import { LetterInfoPart, LETTER_INFO_PART_TYPEID } from '../letter-info-part';

interface LetterInfoPartControls {
  subject: string;
  header: string;
  textDate: string;
}

function toDraft(part?: LetterInfoPart | null): LetterInfoPartControls {
  return {
    subject: part?.subject || '',
    header: part?.header || '',
    textDate: part?.textDate || '',
  };
}

/**
 * LetterInfo part editor component.
 */
@Component({
  selector: 'cadmus-letter-info-part',
  templateUrl: './letter-info-part.component.html',
  styleUrls: ['./letter-info-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatCardActions,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class LetterInfoPartComponent extends ModelEditorComponentBase<LetterInfoPart> {
  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.subject, 3000);
    maxLength(p.header, 500);
    maxLength(p.textDate, 100);
  });

  protected getValue(): LetterInfoPart {
    let part = this.getEditedPart(LETTER_INFO_PART_TYPEID) as LetterInfoPart;
    const draft = this._draft();
    part.subject = draft.subject.trim() || undefined;
    part.header = draft.header.trim() || undefined;
    part.textDate = draft.textDate.trim() || undefined;
    return part;
  }
}
