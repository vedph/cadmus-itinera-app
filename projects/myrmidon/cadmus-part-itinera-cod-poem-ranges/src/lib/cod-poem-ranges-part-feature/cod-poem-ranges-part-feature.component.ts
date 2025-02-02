import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodPoemRangesPartComponent } from '../cod-poem-ranges-part/cod-poem-ranges-part.component';

@Component({
    selector: 'cadmus-cod-poem-ranges-part-feature',
    templateUrl: './cod-poem-ranges-part-feature.component.html',
    styleUrls: ['./cod-poem-ranges-part-feature.component.css'],
    imports: [CurrentItemBarComponent, CodPoemRangesPartComponent],
})
export class CodPoemRangesPartFeatureComponent
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
      'cod-poem-range-sort-types',
      'cod-poem-range-layouts',
      'cod-poem-range-tags',
    ];
  }
}
