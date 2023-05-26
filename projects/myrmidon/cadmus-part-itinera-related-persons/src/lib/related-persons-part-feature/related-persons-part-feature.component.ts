import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';

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
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'related-person-types',
      'asserted-id-tags',
      'asserted-id-scopes',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'pin-link-settings'
    ];
  }
}
