import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  EditItemQuery,
  EditItemService,
  EditPartFeatureBase,
} from '@myrmidon/cadmus-state';

import { EditLiteraryWorkInfoPartQuery } from './edit-literary-work-info-part.query';
import { EditLiteraryWorkInfoPartService } from './edit-literary-work-info-part.service';

@Component({
  selector: 'cadmus-literary-work-info-part-feature',
  templateUrl: './literary-work-info-part-feature.component.html',
  styleUrls: ['./literary-work-info-part-feature.component.css'],
})
export class LiteraryWorkInfoPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    editPartQuery: EditLiteraryWorkInfoPartQuery,
    editPartService: EditLiteraryWorkInfoPartService,
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
      'literary-work-languages',
      'literary-work-genres',
      'literary-work-metres',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ]);
  }
}
