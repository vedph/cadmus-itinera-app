import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedId } from '@myrmidon/cadmus-refs-asserted-ids';

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
    if (this._person === value) {
      return;
    }
    this._person = value;
    this.updateForm(value);
  }

  // related-person-types
  @Input()
  public prsTypeEntries: ThesaurusEntry[] | undefined;
  // asserted-id-tags
  @Input()
  public idTagEntries: ThesaurusEntry[] | undefined;
  // asserted-id-scopes
  @Input()
  public idScopeEntries: ThesaurusEntry[] | undefined;
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

  public type: FormControl<string | null>;
  public name: FormControl<string | null>;
  public ids: FormControl<AssertedId[]>;
  public form: FormGroup;

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
    this.ids = formBuilder.control([], { nonNullable: true });
    this.form = formBuilder.group({
      type: this.type,
      name: this.name,
      ids: this.ids,
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
    this.ids.setValue(model.ids || []);
    this.form.markAsPristine();
  }

  private getModel(): RelatedPerson {
    return {
      type: this.type.value?.trim() || '',
      name: this.name.value?.trim() || '',
      ids: this.ids.value?.length ? this.ids.value : undefined,
    };
  }

  public onIdsChange(ids: AssertedId[]): void {
    this.ids.setValue(ids);
    this.ids.updateValueAndValidity();
    this.ids.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._person = this.getModel();
    this.personChange.emit(this._person);
  }
}
