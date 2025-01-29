import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

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
} from '@myrmidon/cadmus-cod-location';
import { CodImage, CodImagesComponent } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

import { CodLocus } from '../cod-loci-part';

@Component({
  selector: 'cadmus-cod-locus',
  templateUrl: './cod-locus.component.html',
  styleUrls: ['./cod-locus.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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

  public citation: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public images: FormControl<CodImage[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.citation = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.note = formBuilder.control(null, Validators.maxLength(5000));
    this.images = formBuilder.control([], { nonNullable: true });

    this.form = formBuilder.group({
      citation: this.citation,
      ranges: this.ranges,
      text: this.text,
      note: this.note,
      images: this.images,
    });

    effect(() => {
      this.updateForm(this.locus());
    });
  }

  private updateForm(model: CodLocus | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.citation.setValue(model.citation);
    this.ranges.setValue([model.range]);
    this.text.setValue(model.text);
    this.note.setValue(model.note || null);
    this.images.setValue(model.images || []);
    this.form.markAsPristine();
  }

  private getLocus(): CodLocus {
    return {
      citation: this.citation.value?.trim() || '',
      range: this.ranges.value.length ? this.ranges.value[0] : (null as any),
      text: this.text.value?.trim() || '',
      note: this.note.value?.trim() || undefined,
      images: this.images.value?.length ? this.images.value : undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  public onImagesChange(images: CodImage[] | undefined): void {
    this.images.setValue(images || []);
    this.images.updateValueAndValidity();
    this.images.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.locus.set(this.getLocus());
  }
}
