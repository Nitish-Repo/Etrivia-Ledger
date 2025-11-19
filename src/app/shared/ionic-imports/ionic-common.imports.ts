/**
 * Common Ionic Components - Import this in most components
 * Standalone-compatible - Just an array of imports
 */

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';

/**
 * Use this array in your component imports
 * Example:
 * @Component({
 *   imports: [CommonModule, ...IONIC_COMMON_IMPORTS]
 * })
 */
export const IONIC_COMMON_IMPORTS = [
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonSpinner,
  IonBadge,
] as const;
