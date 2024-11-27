import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CodImage } from '@myrmidon/cadmus-codicology-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { CodLocus } from '../cod-loci-part';

@Component({
  selector: 'cadmus-cod-locus',
  templateUrl: './cod-locus.component.html',
  styleUrls: ['./cod-locus.component.css'],
  standalone: false,
})
export class CodLocusComponent implements OnInit {
  private _locus: CodLocus | undefined;

  @Input()
  public get locus(): CodLocus | undefined {
    return this._locus;
  }
  public set locus(value: CodLocus | undefined) {
    if (this._locus === value) {
      return;
    }
    this._locus = value;
    this.updateForm(value);
  }

  // cod-loci
  @Input()
  public locEntries: ThesaurusEntry[] | undefined;
  // cod-image-types
  @Input()
  public imgTypeEntries: ThesaurusEntry[] | undefined;

  @Output()
  public locusChange: EventEmitter<CodLocus>;
  @Output()
  public editorClose: EventEmitter<any>;

  public citation: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public images: FormControl<CodImage[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.locusChange = new EventEmitter<CodLocus>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.citation = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
  }

  ngOnInit(): void {
    if (this._locus) {
      this.updateForm(this._locus);
    }
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

  private getModel(): CodLocus {
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
    this._locus = this.getModel();
    this.locusChange.emit(this._locus);
  }
}
