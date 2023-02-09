import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Assertion } from '@myrmidon/cadmus-refs-assertion';
import { ReferencedText } from '../referenced-texts-part';

@Component({
  selector: 'cadmus-referenced-text',
  templateUrl: './referenced-text.component.html',
  styleUrls: ['./referenced-text.component.css'],
})
export class ReferencedTextComponent implements OnInit {
  private _text: ReferencedText | undefined;

  @Input()
  public get text(): ReferencedText | undefined {
    return this._text;
  }
  public set text(value: ReferencedText | undefined) {
    if (this._text === value) {
      return;
    }
    this._text = value;
    this.updateForm(value);
  }

  // related-text-types
  @Input()
  public txtTypeEntries: ThesaurusEntry[] | undefined;
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
  public noLookup?: boolean;

  @Output()
  public textChange: EventEmitter<ReferencedText>;
  @Output()
  public editorClose: EventEmitter<any>;

  public type: FormControl<string | null>;
  public targetId: FormControl<string | null>;
  public targetCitation: FormControl<string | null>;
  public sourceCitations: FormControl<string | null>;
  public hasAssertion: FormControl<boolean>;
  public assertion: FormControl<Assertion | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.textChange = new EventEmitter<ReferencedText>();
    this.editorClose = new EventEmitter<any>();
    // form
    this.type = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50),
    ]);
    this.targetId = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.targetCitation = formBuilder.control(null, Validators.maxLength(50));
    this.sourceCitations = formBuilder.control(
      null,
      Validators.maxLength(1000)
    );
    this.hasAssertion = formBuilder.control(false, { nonNullable: true });
    this.assertion = formBuilder.control(null);
    this.form = formBuilder.group({
      type: this.type,
      targetId: this.targetId,
      targetCitation: this.targetCitation,
      sourceCitations: this.sourceCitations,
      hasAssertion: this.hasAssertion,
      assertion: this.assertion,
    });
  }

  ngOnInit(): void {}

  private updateForm(model: ReferencedText | undefined): void {
    if (!model) {
      this.form.reset();
      return;
    }

    this.type.setValue(model.type);
    this.targetId.setValue(model.targetId);
    this.targetCitation.setValue(model.targetCitation || null);
    this.sourceCitations.setValue(
      model.sourceCitations?.length ? model.sourceCitations.join('\n') : ''
    );
    this.hasAssertion.setValue(model.assertion ? true : false);
    this.assertion.setValue(model.assertion || null);
    this.form.markAsPristine();
  }

  private parseCitations(text: string | null): string[] | undefined {
    if (!text) {
      return undefined;
    }
    const citations = [
      ...new Set(
        text
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s)
      ),
    ];
    return citations.length ? citations : undefined;
  }

  private getModel(): ReferencedText {
    return {
      type: this.type.value?.trim() || '',
      targetId: this.targetId.value?.trim() || '',
      targetCitation: this.targetCitation.value?.trim(),
      sourceCitations: this.parseCitations(this.sourceCitations.value),
      assertion: this.hasAssertion.value
        ? this.assertion.value || undefined
        : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion || null);
    this.assertion.updateValueAndValidity();
    setTimeout(() => this.assertion.markAsDirty(), 0);
  }

  public onIdPick(id: string): void {
    this.targetId.setValue(id);
    this.targetId.updateValueAndValidity();
    this.targetId.markAsDirty();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this._text = this.getModel();
    this.textChange.emit(this._text);
  }
}
