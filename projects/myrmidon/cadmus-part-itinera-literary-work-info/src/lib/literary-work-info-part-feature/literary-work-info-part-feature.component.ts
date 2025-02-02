import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { LiteraryWorkInfoPartComponent } from '../literary-work-info-part/literary-work-info-part.component';

@Component({
    selector: 'cadmus-literary-work-info-part-feature',
    templateUrl: './literary-work-info-part-feature.component.html',
    styleUrls: ['./literary-work-info-part-feature.component.css'],
    imports: [CurrentItemBarComponent, LiteraryWorkInfoPartComponent],
})
export class LiteraryWorkInfoPartFeatureComponent
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
      'literary-work-languages',
      'literary-work-genres',
      'literary-work-metres',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'asserted-id-scopes',
      'asserted-id-tags',
      'pin-link-settings',
    ];
  }
}
