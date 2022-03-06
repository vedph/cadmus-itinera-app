import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditPersonInfoPartQuery } from './edit-person-info-part.query';
import { EditPersonInfoPartService } from './edit-person-info-part.service';

@Component({
  selector: 'cadmus-person-info-part-feature',
  templateUrl: './person-info-part-feature.component.html',
  styleUrls: ['./person-info-part-feature.component.css'],
})
export class PersonInfoPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditPersonInfoPartQuery,
    editPartService: EditPersonInfoPartService,
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
    this.initEditor(['person-sex']);
  }
}
