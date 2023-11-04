import { ListBase } from '../list-base';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageListItem } from '../image-list-item';
import { ImageListItemComponent } from '../image-list-item/image-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss'],
  imports: [CommonModule, ImageListItemComponent]
})
export class ImageListComponent extends ListBase<ImageListItem> { }