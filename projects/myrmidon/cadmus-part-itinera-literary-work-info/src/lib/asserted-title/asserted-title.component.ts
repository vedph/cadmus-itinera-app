import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

import { AssertedTitle } from '../literary-work-info-part';

@Component({
  selector: 'cadmus-asserted-title',
  templateUrl: './asserted-title.component.html',
  styleUrls: ['./asserted-title.component.css'],
})
export class AssertedTitleComponent implements OnInit {
  private _title: AssertedTitle | undefined;

  @Input()
  public get title(): AssertedTitle | undefined {
    return this._title;
  }
  public set title(value: AssertedTitle | undefined) {
    this._title = value;
    this.updateForm(value);
  }

  // literary-work-languages
  @Input()
  public langEntries: ThesaurusEntry[] | undefined;
  // assertion-tags
  @Input()
  public assTagEntries: ThesaurusEntry[] | undefined;
  // doc-reference-types
  @Input()
  public refTypeEntries: ThesaurusEntry[] | undefined;
  // doc-reference-tags
  @Input()
  public refTagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public titleChange: EventEmitter<AssertedTitle>;
  @Output()
  public editorClose: EventEmitter<any>;

  public language: FormControl;
  public value: FormControl;
  public hasAssertion: FormControl;
  public assertion: FormControl;
  public form: FormGroup;

  public initialAssertion?: Assertion;

  constructor(formBuilder: FormBuilder) {
    this.titleChange = new EventEmitter<AssertedTitle>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.language = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.value = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.hasAssertion = formBuilder.control(false);
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      language: this.language,
      value: this.value,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });
  }

  ngOnInit(): void {
    if (this._title) {
      this.updateForm(this._title);
    }
  }

  private updateForm(model: AssertedTitle | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.language.setValue(model.language);
    this.value.setValue(model.value);
    this.hasAssertion.setValue(model.value ? true : false);
    this.initialAssertion = model.assertion;
    this.form.markAsPristine();
  }

  private getModel(): AssertedTitle {
    return {
      language: this.language.value?.trim(),
      value: this.value.value?.trim(),
      assertion: this.hasAssertion.value ? this.assertion.value : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion);
    this.assertion.updateValueAndValidity();
    setTimeout(() => this.assertion.markAsDirty(), 0);
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.titleChange.emit(this.getModel());
  }
}
