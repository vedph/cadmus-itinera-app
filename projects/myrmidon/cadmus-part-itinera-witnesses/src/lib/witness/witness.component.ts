import { Component, effect, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CodLocationRange,
  CodLocationComponent,
} from '@myrmidon/cadmus-cod-location';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { Witness } from '../witnesses-part';

@Component({
  selector: 'cadmus-witness',
  templateUrl: './witness.component.html',
  styleUrls: ['./witness.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    CodLocationComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class WitnessComponent {
  public readonly witness = model<Witness>();

  public readonly editorClose = output();

  public id: FormControl<string | null>;
  public ranges: FormControl<CodLocationRange[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
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

    effect(() => {
      this.updateForm(this.witness());
    });
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

  private getWitness(): Witness {
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
    this.witness.set(this.getWitness());
  }
}
