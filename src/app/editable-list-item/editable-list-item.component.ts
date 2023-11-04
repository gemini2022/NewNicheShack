import { ListItem } from '../list-item';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListItemBase } from '../editable-list-item-base';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ns-editable-list-item',
  templateUrl: './editable-list-item.component.html',
  styleUrls: ['./editable-list-item.component.scss']
})
export class EditableListItemComponent extends EditableListItemBase<ListItem> { }