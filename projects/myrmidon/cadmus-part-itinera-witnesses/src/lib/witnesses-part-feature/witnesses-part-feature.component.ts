import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';
import { EditWitnessesPartQuery } from './edit-witnesses-part.query';
import { EditWitnessesPartService } from './edit-witnesses-part.service';

@Component({
  selector: 'cadmus-witnesses-part-feature',
  templateUrl: './witnesses-part-feature.component.html',
  styleUrls: ['./witnesses-part-feature.component.css'],
})
export class WitnessesPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditWitnessesPartQuery,
    editPartService: EditWitnessesPartService,
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
    this.initEditor();
  }
}
