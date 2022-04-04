import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { ExternalId } from '@myrmidon/cadmus-refs-external-ids';

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
  // external-id-scopes
  @Input()
  public scopeEntries: ThesaurusEntry[] | undefined;
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
  public ids: FormControl;
  public form: FormGroup;

  public initialIds?: ExternalId[];

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
    this.ids = formBuilder.control([]);
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
    this.initialIds = model.ids || [];
    this.form.markAsPristine();
  }

  private getModel(): RelatedPerson {
    return {
      type: this.type.value?.trim(),
      name: this.name.value?.trim(),
      ids: this.ids.value?.length? this.ids.value : undefined,
    };
  }

  public onIdsChange(ids: ExternalId[]): void {
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
    this.personChange.emit(this.getModel());
  }
}
