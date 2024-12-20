import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

import { PersonWork } from '../person-works-part';

@Component({
  selector: 'cadmus-person-work',
  templateUrl: './person-work.component.html',
  styleUrls: ['./person-work.component.css'],
  standalone: false,
})
export class PersonWorkComponent implements OnInit {
  private _work: PersonWork | undefined;

  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Input()
  public get work(): PersonWork | undefined {
    return this._work;
  }
  public set work(value: PersonWork | undefined) {
    if (this._work === value) {
      return;
    }
    this._work = value;
    this.updateForm(value);
  }

  @Output()
  public workChange: EventEmitter<PersonWork>;
  @Output()
  public editorClose: EventEmitter<any>;

  public eid: FormControl<string | null>;
  public title: FormControl<string | null>;
  public hasAssertion: FormControl<boolean>;
  public assertion: FormControl<Assertion | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.workChange = new EventEmitter<PersonWork>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(100));
    this.title = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.hasAssertion = formBuilder.control(false, { nonNullable: true });
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      eid: this.eid,
      title: this.title,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });
  }

  ngOnInit(): void {}

  private updateForm(model: PersonWork | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.eid.setValue(model.eid || null);
    this.title.setValue(model.title);
    this.assertion.setValue(model.assertion || null);
    this.hasAssertion.setValue(model.assertion ? true : false);
    this.form.markAsPristine();
  }

  private getModel(): PersonWork {
    return {
      eid: this.eid.value?.trim(),
      title: this.title.value?.trim() || '',
      assertion: this.hasAssertion.value
        ? this.assertion.value || undefined
        : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion || null);
    this.assertion.updateValueAndValidity();
    this.assertion.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._work = this.getModel();
    this.workChange.emit(this._work);
  }
}
