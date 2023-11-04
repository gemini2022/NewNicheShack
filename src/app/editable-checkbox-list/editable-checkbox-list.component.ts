import { CommonModule } from '@angular/common';
import { CheckboxListItem } from '../checkbox-list-item';
import { EditableListBase } from '../editable-list-base';
import { Component, EventEmitter, Output } from '@angular/core';
import { EditableCheckboxListItemComponent } from '../editable-checkbox-list-item/editable-checkbox-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-checkbox-list',
  templateUrl: './editable-checkbox-list.component.html',
  styleUrls: ['./editable-checkbox-list.component.scss'],
  imports: [CommonModule, EditableCheckboxListItemComponent]
})
export class EditableCheckboxListComponent extends EditableListBase<CheckboxListItem> {
  @Output() public checkboxChangedEvent: EventEmitter<CheckboxListItem> = new EventEmitter();
}