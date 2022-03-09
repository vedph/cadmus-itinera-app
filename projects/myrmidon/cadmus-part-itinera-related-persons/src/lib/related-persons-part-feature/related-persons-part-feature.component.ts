import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditRelatedPersonsPartQuery } from './edit-related-persons-part.query';
import { EditRelatedPersonsPartService } from './edit-related-persons-part.service';

@Component({
  selector: 'cadmus-related-persons-part-feature',
  templateUrl: './related-persons-part-feature.component.html',
  styleUrls: ['./related-persons-part-feature.component.css'],
})
export class RelatedPersonsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditRelatedPersonsPartQuery,
    editPartService: EditRelatedPersonsPartService,
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
      'related-person-types',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
