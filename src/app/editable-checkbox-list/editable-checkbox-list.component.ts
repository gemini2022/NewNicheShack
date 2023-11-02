import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListComponent } from '../editable-list/editable-list.component';
import { EditableCheckboxListItemComponent } from '../editable-checkbox-list-item/editable-checkbox-list-item.component';
import { CheckboxListItem } from '../checkbox-list-item';

@Component({
  selector: 'ns-editable-checkbox-list',
  standalone: true,
  imports: [CommonModule, EditableCheckboxListItemComponent],
  templateUrl: './editable-checkbox-list.component.html',
  styleUrls: ['./editable-checkbox-list.component.scss']
})
export class EditableCheckboxListComponent extends EditableListComponent {
  // Inputs
  @Input() public override list: Array<CheckboxListItem> = new Array<CheckboxListItem>();

  // Outputs
  @Output() public checkboxChangedEvent: EventEmitter<CheckboxListItem> = new EventEmitter();
 }