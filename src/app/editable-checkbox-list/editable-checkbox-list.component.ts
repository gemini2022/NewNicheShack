import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListComponent } from '../editable-list/editable-list.component';
import { EditableCheckboxListItemComponent } from '../editable-checkbox-list-item/editable-checkbox-list-item.component';

@Component({
  selector: 'ns-editable-checkbox-list',
  standalone: true,
  imports: [CommonModule, EditableCheckboxListItemComponent],
  templateUrl: './editable-checkbox-list.component.html',
  styleUrls: ['./editable-checkbox-list.component.scss']
})
export class EditableCheckboxListComponent extends EditableListComponent {

}