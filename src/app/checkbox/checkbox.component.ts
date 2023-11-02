import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ns-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  // Inputs
  @Input() public label!: string;
  @Input() public isChecked!: boolean;
  @Input() public isDisabled!: boolean;
  @Input() public spaceBetween!: boolean;
  @Input() public labelRight: boolean = true;

  // Outputs
  @Output() public checkboxChangedEvent: EventEmitter<boolean> = new EventEmitter();
  

  // View Child
  @ViewChild('tabElement') public tabElement!: ElementRef<HTMLElement>;



  public onCheckboxChange (): void {
    if (!this.isDisabled) {
      this.isChecked = !this.isChecked;
      this.checkboxChangedEvent.emit(this.isChecked);
    }
  }
}