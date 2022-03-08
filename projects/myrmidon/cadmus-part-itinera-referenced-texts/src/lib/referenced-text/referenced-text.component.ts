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

  @Output()
  public textChange: EventEmitter<ReferencedText>;
  @Output()
  public editorClose: EventEmitter<any>;

  public type: FormControl;
  public targetId: FormControl;
  public targetCitation: FormControl;
  public sourceCitations: FormControl;
  public hasAssertion: FormControl;
  public assertion: FormControl;
  public form: FormGroup;

  public initialAssertion?: Assertion;

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
    this.hasAssertion = formBuilder.control(false);
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
    this.targetCitation.setValue(model.targetCitation);
    this.sourceCitations.setValue(
      model.sourceCitations?.length ? model.sourceCitations.join('\n') : []
    );
    this.hasAssertion.setValue(model.assertion ? true : false);
    this.initialAssertion = model.assertion;
    this.form.markAsPristine();
  }

  private parseCitations(text: string): string[] | undefined {
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
      type: this.type.value?.trim(),
      targetId: this.targetId.value?.trim(),
      targetCitation: this.targetCitation.value?.trim(),
      sourceCitations: this.parseCitations(this.sourceCitations.value),
      assertion: this.hasAssertion.value ? this.assertion.value : undefined,
    };
  }

  public onAssertionChange(assertion: Assertion | undefined): void {
    this.assertion.setValue(assertion);
    setTimeout(() => this.assertion.markAsDirty(), 0);
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.textChange.emit(this.getModel());
  }
}
