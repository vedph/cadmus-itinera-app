import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditPersonWorksPartQuery } from './edit-person-works-part.query';
import { EditPersonWorksPartService } from './edit-person-works-part.service';

@Component({
  selector: 'cadmus-person-works-feature',
  templateUrl: './person-works-part-feature.component.html',
  styleUrls: ['./person-works-part-feature.component.css'],
})
export class PersonWorksPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditPersonWorksPartQuery,
    editPartService: EditPersonWorksPartService,
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
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
