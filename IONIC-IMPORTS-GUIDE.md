# Ionic Imports Guide - Standalone Architecture

## 📦 Available Import Arrays

### 1. **IONIC_COMMON_IMPORTS** - Most Used Components
Use this for 90% of your components.

**Includes:**
- IonContent, IonHeader, IonTitle, IonToolbar
- IonButtons, IonButton, IonIcon
- IonList, IonItem, IonLabel
- IonInput, IonCard (all card variants)
- IonText, IonSpinner, IonBadge

**Usage:**
```typescript
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  imports: [CommonModule, ...IONIC_COMMON_IMPORTS]
})
```

---

### 2. **IONIC_FORMS_IMPORTS** - Form Components
Use for form-heavy pages.

**Includes:**
- IonInput, IonTextarea, IonSearchbar
- IonCheckbox, IonRadio, IonRadioGroup
- IonSelect, IonSelectOption, IonToggle
- IonRange, IonInputPasswordToggle

**Usage:**
```typescript
import { IONIC_FORMS_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  imports: [CommonModule, ReactiveFormsModule, ...IONIC_FORMS_IMPORTS]
})
```

---

### 3. **IONIC_MODALS_IMPORTS** - Overlays
Use when working with modals, popovers, alerts.

**Includes:**
- IonModal, IonPopover, IonActionSheet
- IonAlert, IonLoading, IonToast
- IonBackdrop

**Usage:**
```typescript
import { IONIC_MODALS_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  imports: [CommonModule, ...IONIC_MODALS_IMPORTS]
})
```

---

### 4. **IONIC_NAVIGATION_IMPORTS** - Navigation
Use for pages with tabs, menus, navigation.

**Includes:**
- IonTabs, IonTab, IonTabBar, IonTabButton
- IonNav, IonRouterOutlet
- IonBackButton, IonMenuButton, IonMenu

**Usage:**
```typescript
import { IONIC_NAVIGATION_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  imports: [CommonModule, ...IONIC_NAVIGATION_IMPORTS]
})
```

---

## 🎯 Example Components

### Clean Component (Before)
```typescript
// ❌ Verbose - lots of imports
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonList, IonItem, 
  IonLabel, IonCard, IonCardHeader 
} from '@ionic/angular/standalone';

@Component({
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonList, IonItem, 
    IonLabel, IonCard, IonCardHeader
  ]
})
```

### Clean Component (After)
```typescript
// ✅ Clean - one line!
import { IONIC_COMMON_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  imports: [CommonModule, ...IONIC_COMMON_IMPORTS]
})
```

---

### Form Component
```typescript
import { IONIC_COMMON_IMPORTS, IONIC_FORMS_IMPORTS } from '@app/shared/ionic-imports';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...IONIC_COMMON_IMPORTS,  // Base UI
    ...IONIC_FORMS_IMPORTS     // Form controls
  ]
})
export class UserFormComponent {
  // Your form logic
}
```

---

### Modal Component
```typescript
import { 
  IONIC_COMMON_IMPORTS, 
  IONIC_MODALS_IMPORTS 
} from '@app/shared/ionic-imports';

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ...IONIC_COMMON_IMPORTS,
    ...IONIC_MODALS_IMPORTS
  ]
})
export class DetailsModalComponent {
  // Your modal logic
}
```

---

## 🚀 Benefits

1. **Cleaner Code** - One import line instead of 10+
2. **Consistency** - Same imports across all components
3. **Tree-shakeable** - Still gets optimized by Angular compiler
4. **Easy Updates** - Add new Ionic components in one place
5. **Standalone Compatible** - Works with Angular's modern architecture

---

## 📝 Notes

- All arrays use `as const` for type safety
- Spread operator (`...`) adds all items to your imports
- Mix and match arrays as needed
- Still tree-shakeable - unused components are removed in production build
- TypeScript will autocomplete available components

---

## 💡 Pro Tips

1. **Only import what you need:**
   ```typescript
   // If you only use modals occasionally
   import { IonModal } from '@ionic/angular/standalone';
   
   // Instead of entire IONIC_MODALS_IMPORTS
   ```

2. **Combine as needed:**
   ```typescript
   imports: [
     CommonModule,
     ReactiveFormsModule,
     ...IONIC_COMMON_IMPORTS,
     ...IONIC_FORMS_IMPORTS,
     IonFab, // One-off component
     IonFabButton
   ]
   ```

3. **Create your own custom arrays if needed:**
   ```typescript
   // my-feature-ionic.imports.ts
   export const MY_FEATURE_IMPORTS = [
     ...IONIC_COMMON_IMPORTS,
     IonFab,
     IonFabButton,
     IonSegment
   ] as const;
   ```
