import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditCodLociPartQuery } from './edit-cod-loci-part.query';
import { EditCodLociPartService } from './edit-cod-loci-part.service';

@Component({
  selector: 'cadmus-cod-loci-part-feature',
  templateUrl: './cod-loci-part-feature.component.html',
  styleUrls: ['./cod-loci-part-feature.component.css'],
})
export class CodLociPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditCodLociPartQuery,
    editPartService: EditCodLociPartService,
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
    this.initEditor(['cod-loci', 'cod-image-types']);
  }
}
