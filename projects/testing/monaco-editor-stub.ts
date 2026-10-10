/**
 * A stand-in for the Monaco editor wrapper in specs: the real editor loads
 * Monaco at runtime and needs a real browser layout, so it cannot work in
 * jsdom. This is test-only code.
 */
import {
  Component,
  forwardRef,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * A minimal fake of the Monaco standalone code editor, covering just the
 * API used by the editors in this workspace. It works on the whole text of
 * the stub's textarea, with a selection defined by the textarea itself.
 */
export class FakeMonacoEditor {
  /**
   * The commands registered via addCommand, keyed by their keybinding.
   */
  public readonly commands = new Map<number, () => void>();

  public readonly focus = vi.fn();

  constructor(
    private readonly _textarea: () => HTMLTextAreaElement,
    private readonly _setValue: (value: string) => void,
  ) {}

  public addCommand(keybinding: number, handler: () => void): void {
    this.commands.set(keybinding, handler);
  }

  public getSelection(): { start: number; end: number } {
    const textarea = this._textarea();
    return { start: textarea.selectionStart, end: textarea.selectionEnd };
  }

  public getModel() {
    return {
      getValueInRange: (range: { start: number; end: number }) =>
        this._textarea().value.substring(range.start, range.end),
    };
  }

  public executeEdits(
    _source: string,
    edits: { range: { start: number; end: number }; text: string }[],
  ): void {
    let value = this._textarea().value;
    // apply from the last edit so that earlier ranges stay valid
    for (const edit of [...edits].sort((a, b) => b.range.start - a.range.start)) {
      value =
        value.substring(0, edit.range.start) +
        edit.text +
        value.substring(edit.range.end);
    }
    this._setValue(value);
  }
}

/**
 * A textarea-based replacement for ngx-monaco-editor, usable as a form
 * control. The textarea is labelled "code editor". The fake editor passed
 * to the editorInitialized event is also exposed by the static `lastEditor`
 * property, so that specs can run the commands registered on it.
 */
@Component({
  selector: 'ngx-monaco-editor',
  template: `<textarea
    aria-label="code editor"
    [value]="value()"
    [disabled]="disabled()"
    (input)="onInput($any($event.target).value)"
    (blur)="onTouched()"
  ></textarea>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoEditorStubComponent),
      multi: true,
    },
  ],
})
export class MonacoEditorStubComponent implements ControlValueAccessor, OnInit {
  public static lastEditor?: FakeMonacoEditor;

  public readonly language = input<string>();
  public readonly options = input<unknown>();
  public readonly editorInitialized = output<{ editor: FakeMonacoEditor }>();

  public readonly value = signal<string>('');
  public readonly disabled = signal<boolean>(false);

  private _onChange: (value: string) => void = () => {};
  public onTouched: () => void = () => {};

  public ngOnInit(): void {
    const editor = new FakeMonacoEditor(
      () => document.querySelector('ngx-monaco-editor textarea')!,
      (value) => {
        this.value.set(value);
        this._onChange(value);
      },
    );
    MonacoEditorStubComponent.lastEditor = editor;
    this.editorInitialized.emit({ editor });
  }

  public onInput(value: string): void {
    this.value.set(value);
    this._onChange(value);
  }

  public writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  public registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
