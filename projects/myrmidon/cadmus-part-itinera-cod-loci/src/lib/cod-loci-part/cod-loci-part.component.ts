import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ModelEditorComponentBase,
  CloseSaveButtonsComponent,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import { CodLocationRangePipe } from '@myrmidon/cadmus-cod-location';

import { CodLociPart, CodLocus, COD_LOCI_PART_TYPEID } from '../cod-loci-part';
import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { CodLocusComponent } from '../cod-locus/cod-locus.component';

/**
 * CodLociPart editor component.
 * Thesauri: cod-loci, cod-image-types (all optional).
 */
@Component({
  selector: 'cadmus-cod-loci-part',
  templateUrl: './cod-loci-part.component.html',
  styleUrls: ['./cod-loci-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatTabGroup,
    MatTab,
    MatButton,
    MatIconButton,
    MatTooltip,
    CodLocusComponent,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    CodLocationRangePipe,
  ],
})
export class CodLociPartComponent
  extends ModelEditorComponentBase<CodLociPart>
  implements OnInit
{
  public readonly editedLocus = signal<CodLocus | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);
  public readonly tabIndex = signal<number>(0);

  // cod-loci
  public readonly locEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-image-types
  public readonly imgTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  public loci: FormControl<CodLocus[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.loci = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      loci: this.loci,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-loci';
    if (this.hasThesaurus(key)) {
      this.locEntries.set(thesauri[key].entries);
    } else {
      this.locEntries.set(undefined);
    }

    key = 'cod-image-types';
    if (this.hasThesaurus(key)) {
      this.imgTypeEntries.set(thesauri[key].entries);
    } else {
      this.imgTypeEntries.set(undefined);
    }
  }

  private updateForm(part?: CodLociPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.loci.setValue(part.loci || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodLociPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodLociPart {
    let part = this.getEditedPart(COD_LOCI_PART_TYPEID) as CodLociPart;
    part.loci = this.loci.value || [];
    return part;
  }

  public addLocus(): void {
    const entry: CodLocus = {
      citation: '',
      range: { start: { n: 0 }, end: { n: 0 } },
      text: '',
    };
    this.loci.setValue([...this.loci.value, entry]);
    this.editLocus(this.loci.value.length - 1);
  }

  public editLocus(index: number): void {
    if (index < 0) {
      this.editedIndex.set(-1);
      this.tabIndex.set(0);
      this.editedLocus.set(undefined);
    } else {
      this.editedIndex.set(index);
      this.editedLocus.set(deepCopy(this.loci.value[index]));
      setTimeout(() => {
        this.tabIndex.set(1);
      }, 300);
    }
  }

  public onLocusSave(entry: CodLocus): void {
    this.loci.setValue(
      this.loci.value.map((e: CodLocus, i: number) =>
        i === this.editedIndex() ? entry : e
      )
    );
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
    this.editLocus(-1);
  }

  public onLocusClose(): void {
    this.editLocus(-1);
  }

  public deleteLocus(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete locus?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          const entries = [...this.loci.value];
          entries.splice(index, 1);
          this.loci.setValue(entries);
          this.loci.updateValueAndValidity();
          this.loci.markAsDirty();
        }
      });
  }

  public moveLocusUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.loci.value[index];
    const entries = [...this.loci.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.loci.setValue(entries);
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
  }

  public moveLocusDown(index: number): void {
    if (index + 1 >= this.loci.value.length) {
      return;
    }
    const entry = this.loci.value[index];
    const entries = [...this.loci.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.loci.setValue(entries);
    this.loci.updateValueAndValidity();
    this.loci.markAsDirty();
  }
}
