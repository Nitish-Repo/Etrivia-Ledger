# Quick Reference - Private Layout Usage

## 🎯 Common Tasks

### 1. Add a New Tab

**Step 1:** Add route in `src/app/routes/private.routes.ts`
```typescript
{
  path: 'settings',
  loadComponent: () => import('../features/pages/private/settings/settings.page').then(m => m.SettingsPage)
}
```

**Step 2:** Add tab button in `private-layout.page.html`
```html
<ion-tab-button tab="settings">
  <ion-icon [name]="selectTab === 'settings' ? 'settings' : 'settings-outline'"></ion-icon>
  <ion-label>Settings</ion-label>
</ion-tab-button>
```

**Step 3:** Add to swipeable routes in `private-layout.page.ts`
```typescript
private tabRoutes = ['home', 'dashboard', 'product', 'sell', 'settings'];
```

---

### 2. Add Menu Item (without tab)

In `private-layout.page.html`, inside `<ion-menu>`:
```html
<ion-item [routerLink]="'/reports'" [button]="true" lines="none"
  [ngClass]="{'selected': currentRoute === '/reports'}">
  <ion-icon [name]="currentRoute === '/reports' ? 'document-text' : 'document-text-outline'" slot="start"></ion-icon>
  Reports
</ion-item>
```

---

### 3. Customize Menu Header

Edit the user info section in `private-layout.page.html`:
```html
<ion-item lines="none">
  <ion-avatar slot="start">
    <img [src]="userAvatar">  <!-- Bind to your user data -->
  </ion-avatar>
  <ion-label color="light">
    {{ userName }}  <!-- Bind to your user data -->
    <p>
      <ion-text color="light">
        {{ userEmail }}
      </ion-text>
    </p>
  </ion-label>
</ion-item>
```

In `private-layout.page.ts`:
```typescript
export class PrivateLayoutPage implements OnInit, AfterViewInit {
  userName: string = 'NITISH KUMAR';
  userEmail: string = 'web.nitish.k@gmail.com';
  userAvatar: string = 'assets/images/nk.jpg';

  ngOnInit() {
    // Load user data
    this.loadUserData();
  }

  loadUserData() {
    // Get from auth service or storage
    // this.userName = this.authService.currentUser.name;
  }
}
```

---

### 4. Implement Logout

In `private-layout.page.ts`:
```typescript
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth.service';

constructor(
  private router: Router,
  private authService: AuthService,
  private gestureCtrl: GestureController
) { }

async logout() {
  // Show confirmation
  const confirmed = confirm('Are you sure you want to logout?');
  
  if (confirmed) {
    // Clear auth data
    await this.authService.logout();
    
    // Navigate to login
    this.router.navigate(['/login']);
  }
}
```

---

### 5. Disable Swipe for Specific Pages

**Option A:** Add to page component:
```typescript
ngOnInit() {
  // Disable swipe on this page
  const gesture = document.querySelector('ion-gesture');
  if (gesture) {
    (gesture as any).disabled = true;
  }
}

ngOnDestroy() {
  // Re-enable when leaving
  const gesture = document.querySelector('ion-gesture');
  if (gesture) {
    (gesture as any).disabled = false;
  }
}
```

**Option B:** Conditional in private-layout.page.ts:
```typescript
private setupSwipeGesture() {
  // Don't setup swipe for certain routes
  if (this.currentRoute.includes('/form') || this.currentRoute.includes('/edit')) {
    return;
  }
  // ... rest of gesture setup
}
```

---

### 6. Add FAB Button (Centered between tabs)

In `private-layout.page.html`, before `</ion-tabs>`:
```html
<ion-fab vertical="bottom" horizontal="center" slot="fixed" 
  style="margin-bottom: 56px;">  <!-- Adjust based on tab bar height -->
  <ion-fab-button routerLink="/add-transaction" color="primary">
    <ion-icon name="add"></ion-icon>
  </ion-fab-button>
</ion-fab>
```

---

### 7. Add Badge to Tab

```html
<ion-tab-button tab="home">
  <ion-icon [name]="selectTab === 'home' ? 'home' : 'home-outline'"></ion-icon>
  <ion-label>Home</ion-label>
  <ion-badge color="danger" *ngIf="notificationCount > 0">
    {{ notificationCount }}
  </ion-badge>
</ion-tab-button>
```

In component:
```typescript
notificationCount: number = 0;

ngOnInit() {
  // Load notification count
  this.loadNotifications();
}
```

---

### 8. Change Tab Programmatically

```typescript
// From any child component
constructor(private router: Router) {}

navigateToTab(tabName: string) {
  this.router.navigate([`/${tabName}`]);
}

// Usage
this.navigateToTab('dashboard');
```

---

### 9. Customize Swipe Behavior

In `private-layout.page.ts`:
```typescript
private setupSwipeGesture() {
  const contentElement = document.querySelector('#main-content ion-content');
  if (!contentElement) return;

  const gesture = this.gestureCtrl.create({
    el: contentElement,
    gestureName: 'swipe-tabs',
    threshold: 20,        // Increase for less sensitivity
    direction: 'x',       // Only horizontal
    onEnd: (detail) => {
      const deltaX = detail.deltaX;
      const deltaY = detail.deltaY;
      const velocityX = detail.velocityX;
      
      // Require faster swipe
      if (Math.abs(velocityX) < 0.3) return;
      
      // Require longer swipe
      if (Math.abs(deltaX) < 100) return;
      
      // Only if more horizontal than vertical
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      const currentIndex = this.tabRoutes.indexOf(this.selectTab);
      
      if (deltaX > 0 && currentIndex > 0) {
        this.navigateToTab(this.tabRoutes[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < this.tabRoutes.length - 1) {
        this.navigateToTab(this.tabRoutes[currentIndex + 1]);
      }
    }
  });

  gesture.enable();
}
```

---

### 10. Detect Current Active Tab

In your page components:
```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

ngOnInit() {
  const currentUrl = this.router.url;
  console.log('Current tab:', currentUrl); // e.g., '/home'
  
  // Do something based on tab
  if (currentUrl === '/home') {
    this.loadHomeData();
  }
}
```

---

## 🎨 Styling Tips

### Change Menu Background
```scss
// In private-layout.page.scss
ion-menu {
  ion-content {
    --background: linear-gradient(180deg, #fff 0%, #f5f5f5 100%);
  }
}
```

### Tab Bar Shadow
```scss
ion-tab-bar {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
```

### Active Tab Animation
```scss
ion-tab-button.tab-selected {
  animation: tabPulse 0.3s ease;
}

@keyframes tabPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

## 🔧 Debugging

### Check if Tabs are Working
```typescript
// In private-layout.page.ts
ngAfterViewInit() {
  console.log('Tabs:', this.tabs);
  console.log('Current tab:', this.tabs?.getSelected());
}
```

### Monitor Swipe Gestures
```typescript
onEnd: (detail) => {
  console.log('Swipe:', {
    deltaX: detail.deltaX,
    deltaY: detail.deltaY,
    velocity: detail.velocityX,
    currentTab: this.selectTab
  });
  // ... rest of code
}
```

### Check Routes
```typescript
ngOnInit() {
  this.router.events.subscribe(event => {
    console.log('Router event:', event);
  });
}
```

---

## 📱 Platform-Specific

### iOS Safe Area (Notch)
```scss
ion-tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Android Back Button
```typescript
import { Platform } from '@ionic/angular/standalone';

constructor(private platform: Platform) {}

ngOnInit() {
  this.platform.backButton.subscribeWithPriority(10, () => {
    // Handle back button
    if (this.selectTab !== 'home') {
      this.router.navigate(['/home']);
    } else {
      // Exit app or show confirmation
    }
  });
}
```

---

## ⚡ Performance Tips

1. **Lazy Load Pages:** Already implemented with `loadComponent`
2. **Preload Icons:** Icons are registered in constructor
3. **Gesture Debounce:** Add delay between swipes:
   ```typescript
   private lastSwipe = 0;
   
   onEnd: (detail) => {
     const now = Date.now();
     if (now - this.lastSwipe < 500) return; // 500ms cooldown
     this.lastSwipe = now;
     // ... swipe logic
   }
   ```

---

**Last Updated:** November 20, 2025
