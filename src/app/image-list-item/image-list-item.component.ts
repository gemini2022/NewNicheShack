import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageListItem } from '../image-list-item';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  selector: 'ns-image-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-list-item.component.html',
  styleUrls: ['./image-list-item.component.scss']
})
export class ImageListItemComponent extends ListItemComponent {
  @Input() public override listItem: ImageListItem = new ImageListItem('', '');
}