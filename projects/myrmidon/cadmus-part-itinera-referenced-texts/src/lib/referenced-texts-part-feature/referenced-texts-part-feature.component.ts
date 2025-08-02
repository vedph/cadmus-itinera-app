import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { ReferencedTextsPartComponent } from '../referenced-texts-part/referenced-texts-part.component';

@Component({
  selector: 'cadmus-referenced-texts-part-feature',
  templateUrl: './referenced-texts-part-feature.component.html',
  styleUrls: ['./referenced-texts-part-feature.component.css'],
  imports: [CurrentItemBarComponent, ReferencedTextsPartComponent],
})
export class ReferencedTextsPartFeatureComponent
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
      'related-text-types',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ];
  }
}
