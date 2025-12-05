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
import { User } from '../../../models/user';
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
import { DatabaseService } from '@app/core/database/services/database.service';

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
    private db: DatabaseService,
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
  }

  async ngOnInit() {
    console.log('👤 UsersComponent initialized');
    
    // Subscribe to database ready state
    this.db.getDatabaseState().subscribe(async (isReady) => {
      if (isReady) {
        this.dbStatus = 'Connected ✓';
        this.isDbConnected = true;
        console.log('✅ Database connected');
        await this.loadUsers();
      } else {
        this.dbStatus = 'Connecting...';
        this.isDbConnected = false;
        console.log('⏳ Database not ready yet');
      }
      this.cdr.markForCheck();
    });
  }

  async loadUsers() {
    try {
      this.userList = await this.db.getAll<User>('users');
      console.log(`📋 Loaded ${this.userList.length} users`);
      this.cdr.markForCheck();
    } catch (err) {
      console.error('❌ Error loading users:', err);
      this.dbStatus = 'Error - Check Console';
      this.isDbConnected = false;
      this.cdr.markForCheck();
    }
  }

  async createUser() {
    if (this.newUserName.trim()) {
      await this.db.insert('users', { name: this.newUserName.trim() });
      this.newUserName = '';
      await this.loadUsers();
      this.cdr.markForCheck();
    }
  }

  async toggleUserActive(user: User) {
    const active = user.active === 0 ? 1 : 0;
    await this.db.update('users', user.id, { active });
    await this.loadUsers();
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
      await this.db.update('users', user.id, { name: this.editingUserName.trim() });
      await this.loadUsers();
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
            await this.db.delete('users', user.id);
            await this.loadUsers();
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
