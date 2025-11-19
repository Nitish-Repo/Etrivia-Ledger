import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-question-modal',
  templateUrl: './question-modal.component.html',
  styleUrls: ['./question-modal.component.scss'],
})
export class QuestionModalComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @Input() name!: string;


  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    // Ensure modal is initialized
    if (!this.modal) {
      console.error('Modal is not initialized');
    }
  }

  open() {
    if (this.modal) {
      this.modal.present();
    } else {
      console.error('Modal is not defined');
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }


}
