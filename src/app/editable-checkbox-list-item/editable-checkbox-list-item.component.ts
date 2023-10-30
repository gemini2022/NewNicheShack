import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableListItemComponent } from '../editable-list-item/editable-list-item.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'ns-editable-checkbox-list-item',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './editable-checkbox-list-item.component.html',
  styleUrls: ['./editable-checkbox-list-item.component.scss']
})
export class EditableCheckboxListItemComponent extends EditableListItemComponent { }