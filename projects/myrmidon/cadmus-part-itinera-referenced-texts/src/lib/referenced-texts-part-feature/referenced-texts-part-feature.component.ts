import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditReferencedTextsPartQuery } from './edit-referenced-texts-part.query';
import { EditReferencedTextsPartService } from './edit-referenced-texts-part.service';

@Component({
  selector: 'cadmus-referenced-texts-part-feature',
  templateUrl: './referenced-texts-part-feature.component.html',
  styleUrls: ['./referenced-texts-part-feature.component.css'],
})
export class ReferencedTextsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditReferencedTextsPartQuery,
    editPartService: EditReferencedTextsPartService,
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
    this.initEditor([
      'related-text-types',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
