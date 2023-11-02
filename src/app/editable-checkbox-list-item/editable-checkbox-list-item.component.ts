import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListItemComponent } from '../editable-list-item/editable-list-item.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { CheckboxListItem } from '../checkbox-list-item';

@Component({
  selector: 'ns-editable-checkbox-list-item',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './editable-checkbox-list-item.component.html',
  styleUrls: ['./editable-checkbox-list-item.component.scss']
})
export class EditableCheckboxListItemComponent extends EditableListItemComponent {
  // Inputs
  @Input() public override listItem: CheckboxListItem = new CheckboxListItem('', '');

  // Outputs
  @Output() public checkboxChangedEvent: EventEmitter<CheckboxListItem> = new EventEmitter();
}