# Private Layout with Sidemenu & Swipeable Tabs - Setup Guide

## 📱 What's Implemented

Your private layout now includes:
1. **Ion-Menu** (Side navigation menu)
2. **Ion-Tabs** (Bottom tab bar with footer)
3. **Swipeable Tabs** (Swipe left/right to change tabs)
4. **Integrated Toolbar** (Header with menu toggle and actions)

## 🏗️ Structure

```
src/app/layouts/private/
├── private-layout.page.html     # Main layout with menu + tabs
├── private-layout.page.ts       # Layout logic with swipe gestures
├── private-layout.page.scss     # Styling for menu, tabs, and content
├── toolbar/                     # Header toolbar component
├── sidemenu/                    # Legacy - now integrated
└── footer/                      # Legacy - now integrated
```

## 🔄 How It Works

### Routes Configuration
The `private.routes.ts` now wraps all private pages in the layout:

```typescript
{
  path: '',
  loadComponent: () => import('../layouts/private/private-layout.page'),
  children: [
    { path: 'home', loadComponent: ... },
    { path: 'dashboard', loadComponent: ... },
    { path: 'product', loadComponent: ... },
    { path: 'sell', loadComponent: ... }
  ]
}
```

### Tab Navigation
Tabs automatically navigate between routes:
- **Home** → `/home`
- **Dashboard** → `/dashboard`
- **Products** → `/product`
- **Sell** → `/sell`

### Swipe Gestures
- **Swipe Left** → Next tab (e.g., Home → Dashboard)
- **Swipe Right** → Previous tab (e.g., Dashboard → Home)
- Minimum swipe distance: 50px
- Only works for horizontal swipes

## 🎨 Customization

### Change Tab Icons
Edit `private-layout.page.html`:
```html
<ion-tab-button tab="home">
  <ion-icon [name]="selectTab === 'home' ? 'home' : 'home-outline'"></ion-icon>
  <ion-label>Home</ion-label>
</ion-tab-button>
```

### Modify Menu Items
Edit the `<ion-menu>` section in `private-layout.page.html`:
```html
<ion-item [routerLink]="'/your-route'" [button]="true" lines="none">
  <ion-icon name="your-icon" slot="start"></ion-icon>
  Your Label
</ion-item>
```

### Adjust Swipe Sensitivity
In `private-layout.page.ts`, modify:
```typescript
threshold: 15,  // Lower = more sensitive
// In onEnd callback:
Math.abs(deltaX) > 50  // Change minimum swipe distance
```

### Styling

**Menu Width:**
```scss
ion-menu {
  --width: 280px;  // Adjust as needed
}
```

**Tab Bar Height:**
```scss
ion-tab-bar {
  height: 56px;  // Adjust height
}
```

**Colors:**
Update in `theme/variables.scss` or inline:
```scss
--ion-color-primary: #3880ff;
--ion-color-secondary: #3dc2ff;
```

## 📋 Features

### Menu Features
- ✅ Avatar with user info
- ✅ Gradient header background
- ✅ Active route highlighting
- ✅ Auto-close on navigation (menu-toggle)
- ✅ Logout functionality

### Tab Features
- ✅ Icon-only tabs with labels
- ✅ Active tab highlighting
- ✅ Filled/outline icon switching
- ✅ Swipe to navigate
- ✅ Synchronized with menu

### Toolbar Features
- ✅ Menu toggle button
- ✅ Notification icon
- ✅ Stats/charts icon
- ✅ Customizable action buttons

## 🚀 Usage

### Opening the Menu
**From Template:**
```html
<ion-button (click)="menuCtrl.open()">
  <ion-icon name="menu"></ion-icon>
</ion-button>
```

**From Component:**
```typescript
import { MenuController } from '@ionic/angular/standalone';

constructor(private menuCtrl: MenuController) {}

openMenu() {
  this.menuCtrl.open();
}
```

### Programmatic Tab Navigation
```typescript
this.router.navigate(['/dashboard']);
```

### Disable Swipe on Specific Pages
Add to your page component:
```typescript
ngOnInit() {
  const gesture = document.querySelector('ion-gesture');
  if (gesture) {
    // Disable gesture temporarily
  }
}
```

## 🐛 Troubleshooting

### Swipe Not Working
1. Check if content has `[scrollY]="false"` on ion-content
2. Ensure gesture controller is imported
3. Verify timeout in `ngAfterViewInit` (may need adjustment)

### Tabs Not Showing
1. Verify route paths match tab names
2. Check if children routes are loaded
3. Ensure `ion-tabs` is in the template

### Menu Not Opening
1. Check `contentId="main-content"` matches the div ID
2. Verify MenuController is injected
3. Ensure menu is not disabled

## 📱 Testing

1. **Run the app:**
   ```bash
   ionic serve
   ```

2. **Test swipe gestures:**
   - Swipe left/right on the content area
   - Should change tabs smoothly

3. **Test menu:**
   - Click menu button in toolbar
   - Menu should slide in from left
   - Click menu items to navigate

4. **Test tabs:**
   - Click tab buttons
   - Should navigate to respective pages
   - Active tab should be highlighted

## 🔧 Advanced Configuration

### Add FAB Button (Floating Action Button)
```html
<ion-fab vertical="bottom" horizontal="center" slot="fixed">
  <ion-fab-button routerLink="/add">
    <ion-icon name="add"></ion-icon>
  </ion-fab-button>
</ion-fab>
```

### Add Badges to Tabs
```html
<ion-tab-button tab="home">
  <ion-icon name="home"></ion-icon>
  <ion-badge color="danger">5</ion-badge>
</ion-tab-button>
```

### Dark Mode Support
The layout automatically supports Ionic's dark mode. Customize in `variables.scss`.

## 📚 Next Steps

1. **Implement Logout:** Add auth service logic in `logout()` method
2. **User Data:** Connect menu to real user data
3. **Permissions:** Add role-based menu items
4. **Animations:** Add custom page transitions
5. **Gestures:** Fine-tune swipe sensitivity for your UX

## 📝 Notes

- The old `footer.page` and `sidemenu.page` components are now integrated into `private-layout.page`
- You can keep them as backup or reference
- All tab routes must be children of the private-layout route
- Swipe gestures work best on mobile devices
- Test on actual devices for best gesture experience

---

**Need Help?**
- Check Ionic docs: https://ionicframework.com/docs
- Gesture API: https://ionicframework.com/docs/utilities/gestures
- Tabs guide: https://ionicframework.com/docs/api/tabs
