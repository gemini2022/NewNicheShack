import { CommonModule } from '@angular/common';
import { CheckboxListItem } from '../checkbox-list-item';
import { Component, EventEmitter, Output } from '@angular/core';
import { EditableListItemBase } from '../editable-list-item-base';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  standalone: true,
  selector: 'ns-editable-checkbox-list-item',
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './editable-checkbox-list-item.component.html',
  styleUrls: ['./editable-checkbox-list-item.component.scss']
})
export class EditableCheckboxListItemComponent extends EditableListItemBase<CheckboxListItem> {
  @Output() public checkboxChangedEvent: EventEmitter<CheckboxListItem> = new EventEmitter();
}