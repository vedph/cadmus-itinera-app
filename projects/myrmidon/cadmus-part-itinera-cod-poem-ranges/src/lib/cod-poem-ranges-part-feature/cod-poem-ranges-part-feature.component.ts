import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodPoemRangesPartQuery } from './edit-cod-poem-ranges-part.service';
import { EditCodPoemRangesPartService } from './edit-cod-poem-ranges-part.query';

@Component({
  selector: 'cadmus-cod-poem-ranges-part-feature',
  templateUrl: './cod-poem-ranges-part-feature.component.html',
  styleUrls: ['./cod-poem-ranges-part-feature.component.css'],
})
export class CodPoemRangesPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodPoemRangesPartQuery,
    editPartService: EditCodPoemRangesPartService,
    editItemQuery: EditItemQuery,
    editItemService: EditItemService
  ) {
    super(
      router,
      route,
      snackbar,
      editPartQuery,
      editPartService,
      editItemQuery,
      editItemService
    );
  }

  public ngOnInit(): void {
    this.initEditor(['cod-poem-range-sort-types', 'cod-poem-range-layouts']);
  }
}
