import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemBase } from '../list-item-base';
import { ImageListItem } from '../image-list-item';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ns-image-list-item',
  templateUrl: './image-list-item.component.html',
  styleUrls: ['./image-list-item.component.scss']
})
export class ImageListItemComponent extends ListItemBase<ImageListItem> { }