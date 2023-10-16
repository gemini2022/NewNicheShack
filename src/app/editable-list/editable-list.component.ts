import { EditableList } from '../editable-list';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListItemComponent } from '../editable-list-item/editable-list-item.component';

@Component({
  selector: 'ns-editable-list',
  standalone: true,
  imports: [CommonModule, EditableListItemComponent],
  templateUrl: './editable-list.component.html',
  styleUrls: ['./editable-list.component.scss']
})
export class EditableListComponent extends EditableList { }