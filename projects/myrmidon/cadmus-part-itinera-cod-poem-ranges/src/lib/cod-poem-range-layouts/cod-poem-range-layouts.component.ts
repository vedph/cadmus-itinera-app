import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CodPoemLayout } from '../cod-poem-ranges-part';
import { Alnum } from '../services/alnum';

import { AlnumRange } from '../services/alnum-range.service';

@Component({
  selector: 'cadmus-cod-poem-range-layouts',
  templateUrl: './cod-poem-range-layouts.component.html',
  styleUrls: ['./cod-poem-range-layouts.component.css'],
})
export class CodPoemRangeLayoutsComponent implements OnInit {
  private _ranges: AlnumRange[];
  private _layouts : CodPoemLayout[];
  // TODO

  @Input()
  public get ranges(): AlnumRange[] {
    return this._ranges;
  }
  public set ranges(value: AlnumRange[]) {
    this._ranges = value;
  }

  @Input()
  public get layouts() : CodPoemLayout[] {
    return this._layouts;
  }
  public set layouts(value : CodPoemLayout[]) {
    this._layouts = value;
  }

  constructor() {
    this._ranges = [];
    this._layouts = [];
  }

  ngOnInit(): void {}
}
