import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CodLocationRange } from '@myrmidon/cadmus-cod-location';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

import { Witness } from '../witnesses-part';

@Component({
  selector: 'cadmus-witness',
  templateUrl: './witness.component.html',
  styleUrls: ['./witness.component.css'],
  standalone: false,
})
export class WitnessComponent implements OnInit {
  private _witness: Witness | undefined;

  @Input()
  public get witness(): Witness | undefined {
    return this._witness;
  }
  public set witness(value: Witness | undefined) {
    if (this._witness === value) {
      return;
    }
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

  constructor(formBuilder: FormBuilder) {
    this.witnessChange = new EventEmitter<Witness>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.id = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.ranges = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
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
    this.ranges.setValue(model.ranges || []);
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
    this._witness = this.getModel();
    this.witnessChange.emit(this._witness);
  }
}
