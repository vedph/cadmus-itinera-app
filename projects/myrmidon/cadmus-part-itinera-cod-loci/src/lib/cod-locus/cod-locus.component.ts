import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  CodLocationRange,
  CodLocationComponent,
  CodLocationParser,
} from '@myrmidon/cadmus-cod-location';
import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

import { CodLocus } from '../cod-loci-part';

interface CodLocusControls {
  citation: string;
  ranges: CodLocationRange[];
  text: string;
  note: string;
  images: CodImage[];
}

function toDraft(locus?: CodLocus): CodLocusControls {
  return {
    citation: locus?.citation || '',
    // the range of a new locus is a placeholder rendered as an empty
    // location: it is not a location, so it must not satisfy validation
    ranges:
      locus?.range && CodLocationParser.rangesToString([locus.range])
        ? [copyFormValue(locus.range)]
        : [],
    text: locus?.text || '',
    note: locus?.note || '',
    images: copyFormValue(locus?.images || []),
  };
}

@Component({
  selector: 'cadmus-cod-locus',
  templateUrl: './cod-locus.component.html',
  styleUrls: ['./cod-locus.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    CodLocationComponent,
    CodImagesComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class CodLocusComponent {
  public readonly locus = model<CodLocus>();

  // cod-loci
  public readonly locEntries = input<ThesaurusEntry[]>();
  // cod-image-types
  public readonly imgTypeEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  private readonly _draft = linkedSignal(() => toDraft(this.locus()));
  public readonly form = form(this._draft, (p) => {
    required(p.citation);
    maxLength(p.citation, 50);
    NgxToolsSignalValidators.strictMinLength(p.ranges, 1);
    maxLength(p.text, 1000);
    maxLength(p.note, 5000);
  });

  constructor() {
    // a new locus was bound: no unsaved edits (keyed on the bound model:
    // the draft also changes with each user edit)
    effect(() => {
      this.locus();
      untracked(() => this.form().reset());
    });
  }

  private getLocus(): CodLocus {
    const draft = this._draft();
    return {
      citation: draft.citation.trim(),
      range: draft.ranges.length
        ? copyFormValue(draft.ranges[0])
        : (null as any),
      text: draft.text.trim(),
      note: draft.note.trim() || undefined,
      images: draft.images.length ? copyFormValue(draft.images) : undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    setFieldFromChild(this.form.ranges, copyFormValue(ranges || []));
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    setFieldFromChild(this.form.images, copyFormValue(images || []));
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  /**
   * Handle Enter in this editor: in a text input, save as the save button
   * would, when enabled. This replaces the implicit submission of the form
   * this editor used to render.
   * @param event The keydown event.
   */
  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      this.form().invalid() ||
      !this.form().dirty()
    ) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.locus.set(this.getLocus());
  }
}
