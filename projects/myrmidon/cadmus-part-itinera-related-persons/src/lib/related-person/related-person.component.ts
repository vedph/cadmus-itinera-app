import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';

import { RelatedPerson } from '../related-persons-part';

@Component({
  selector: 'cadmus-related-person',
  templateUrl: './related-person.component.html',
  styleUrls: ['./related-person.component.css'],
})
export class RelatedPersonComponent implements OnInit {
  private _person: RelatedPerson | undefined;

  @Input()
  public get person(): RelatedPerson | undefined {
    return this._person;
  }
  public set person(value: RelatedPerson | undefined) {
    this._person = value;
    this.updateForm(value);
  }

  // related-person-types
  @Input()
  public prsTypeEntries: ThesaurusEntry[] | undefined;
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
  public personChange: EventEmitter<RelatedPerson>;
  @Output()
  public editorClose: EventEmitter<any>;

  public type: FormControl;
  public name: FormControl;
  public targetId: FormControl;
  public hasAssertion: FormControl;
  public assertion: FormControl;
  public form: FormGroup;

  public initialAssertion?: Assertion;

  constructor(formBuilder: FormBuilder) {
    this.personChange = new EventEmitter<RelatedPerson>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.name = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.targetId = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(500),
    ]);
    this.hasAssertion = formBuilder.control(false);
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      type: this.type,
      name: this.name,
      targetId: this.targetId,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });
  }

  ngOnInit(): void {}

  private updateForm(model: RelatedPerson | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.name.setValue(model.name);
    this.targetId.setValue(model.targetId);
    this.hasAssertion.setValue(model.assertion ? true : false);
    this.initialAssertion = model.assertion;
    this.form.markAsPristine();
  }

  private getModel(): RelatedPerson {
    return {
      type: this.type.value?.trim(),
      name: this.name.value?.trim(),
      targetId: this.targetId.value?.trim(),
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
    this.personChange.emit(this.getModel());
  }
}
