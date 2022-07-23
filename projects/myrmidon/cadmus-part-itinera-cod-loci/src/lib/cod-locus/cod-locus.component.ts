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
})
export class CodLocusComponent implements OnInit {
  private _model: CodLocus | undefined;

  @Input()
  public get locus(): CodLocus | undefined {
    return this._model;
  }
  public set locus(value: CodLocus | undefined) {
    this._model = value;
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
  public range: FormControl<CodLocationRange[]>;
  public text: FormControl<string | null>;
  public images: FormControl<CodImage[]>;
  public form: FormGroup;

  public initialImages: CodImage[];
  public initialRanges: CodLocationRange[];

  constructor(formBuilder: FormBuilder) {
    this.locusChange = new EventEmitter<CodLocus>();
    this.editorClose = new EventEmitter<any>();
    this.initialImages = [];
    this.initialRanges = [];
    // form
    this.citation = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.range = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.text = formBuilder.control(null, Validators.maxLength(1000));
    this.images = formBuilder.control([], { nonNullable: true });

    this.form = formBuilder.group({
      citation: this.citation,
      range: this.range,
      text: this.text,
      images: this.images,
    });
  }

  ngOnInit(): void {
    if (this._model) {
      this.updateForm(this._model);
    }
  }

  private updateForm(model: CodLocus | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.citation.setValue(model.citation);
    this.initialRanges = [model.range];
    this.text.setValue(model.text);
    this.initialImages = model.images || [];
    this.form.markAsPristine();
  }

  private getModel(): CodLocus {
    return {
      citation: this.citation.value?.trim() || '',
      range: this.range.value.length ? this.range.value[0] : null as any,
      text: this.text.value?.trim() || '',
      images: this.images.value?.length ? this.images.value : undefined,
    };
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.range.setValue(ranges || []);
    this.range.updateValueAndValidity();
    this.range.markAsDirty();
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
    this.locusChange.emit(this.getModel());
  }
}
