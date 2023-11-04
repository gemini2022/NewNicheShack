import { ListItem } from '../list-item';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { EditableListItemComponent } from '../editable-list-item/editable-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-list',
  templateUrl: './editable-list.component.html',
  styleUrls: ['./editable-list.component.scss'],
  imports: [CommonModule, EditableListItemComponent]
})
export class EditableListComponent extends EditableListBase<ListItem> { }