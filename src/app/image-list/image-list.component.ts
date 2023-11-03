import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageListItem } from '../image-list-item';
import { ListComponent } from '../list/list.component';
import { ImageListItemComponent } from '../image-list-item/image-list-item.component';

@Component({
  selector: 'ns-image-list',
  standalone: true,
  imports: [CommonModule, ImageListItemComponent],
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent extends ListComponent {
  @Input() public override list: Array<ImageListItem> = new Array<ImageListItem>();
}