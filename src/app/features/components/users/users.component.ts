import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent,
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonList, 
  IonListHeader,
  IonText,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { User } from '../../../models/user';
import { of, switchMap } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  addCircleOutline, 
  toggle, 
  toggleOutline, 
  trashOutline, 
  peopleOutline,
  createOutline,
  checkmarkOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonListHeader,
    IonText,
    IonIcon
  ],
  standalone: true,
})
export class UsersComponent implements OnInit {
  newUserName = '';
  userList: User[] = [];
  dbStatus = 'Initializing...';
  isDbConnected = false;
  editingUserId: number | null = null;
  editingUserName = '';

  constructor(
    private storage: StorageService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ 
      addCircleOutline, 
      toggle, 
      toggleOutline, 
      trashOutline, 
      peopleOutline,
      createOutline,
      checkmarkOutline,
      closeOutline
    });
  }  ngOnInit() {
    console.log('👤 UsersComponent initialized');
    
    // Add a small delay to ensure services are ready
    setTimeout(() => {
      this.storage.userState().pipe(
        switchMap(res => {
          if (res) {
            this.dbStatus = 'Connected ✓';
            this.isDbConnected = true;
            console.log('✅ Database connected');
            return this.storage.fetchUsers();
          } else {
            this.dbStatus = 'Connecting...';
            this.isDbConnected = false;
            console.log('⏳ Database not ready yet');
            return of([]);
          }
        })
      ).subscribe({
        next: (data) => {
          this.userList = data;
          console.log(`📋 Loaded ${data.length} users`);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error loading users:', err);
          this.dbStatus = 'Error - Check Console';
          this.isDbConnected = false;
          this.cdr.markForCheck();
        }
      });
    }, 100);
  }

  async createUser() {
    if (this.newUserName.trim()) {
      await this.storage.addUser(this.newUserName);
      this.newUserName = '';
      this.cdr.markForCheck();
    }
  }

  async toggleUserActive(user: User) {
    const active = user.active === 0 ? 1 : 0;
    await this.storage.updateUserById(user.id.toString(), active);
    this.cdr.markForCheck();
  }

  startEdit(user: User) {
    this.editingUserId = user.id;
    this.editingUserName = user.name;
  }

  cancelEdit() {
    this.editingUserId = null;
    this.editingUserName = '';
  }

  async saveEdit(user: User) {
    if (this.editingUserName.trim() && this.editingUserName !== user.name) {
      await this.storage.updateUserName(user.id.toString(), this.editingUserName.trim());
    }
    this.cancelEdit();
    this.cdr.markForCheck();
  }

  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${user.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.storage.deleteUserById(user.id.toString());
            this.cdr.markForCheck();
          }
        }
      ]
    });

    await alert.present();
  }

  isEditing(userId: number): boolean {
    return this.editingUserId === userId;
  }
}
