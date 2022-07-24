import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { CadmusValidators } from '@myrmidon/cadmus-core';

import { Witness } from '../witnesses-part';

@Component({
  selector: 'cadmus-witness',
  templateUrl: './witness.component.html',
  styleUrls: ['./witness.component.css'],
})
export class WitnessComponent implements OnInit {
  private _witness: Witness | undefined;

  @Input()
  public get witness(): Witness | undefined {
    return this._witness;
  }
  public set witness(value: Witness | undefined) {
    this._witness = value;
    this.updateForm(value);
  }

  @Output()
  public witnessChange: EventEmitter<Witness>;
  @Output()
  public editorClose: EventEmitter<any>;

  public id: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public form: FormGroup;

  public initialRanges: CodLocationRange[];

  constructor(formBuilder: FormBuilder) {
    this.initialRanges = [];
    this.witnessChange = new EventEmitter<Witness>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.ranges = formBuilder.control([], {
      validators: CadmusValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.form = formBuilder.group({
      id: this.id,
      ranges: this.ranges,
    });
  }

  ngOnInit(): void {
    if (this._witness) {
      this.updateForm(this._witness);
    }
  }

  private updateForm(model: Witness | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.id.setValue(model.id);
    this.initialRanges = model.ranges || [];
    this.form.markAsPristine();
  }

  public onLocationChange(ranges: CodLocationRange[] | null): void {
    this.ranges.setValue(ranges || []);
    this.ranges.updateValueAndValidity();
    this.ranges.markAsDirty();
  }

  private getModel(): Witness {
    return {
      id: this.id.value?.trim() || '',
      ranges: this.ranges.value ?? [],
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.witnessChange.emit(this.getModel());
  }
}
