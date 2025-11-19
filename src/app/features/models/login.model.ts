import { ModelMeta } from '@app/shared-services';

export interface Login {
  email: string;
  // role: string;
  password: string;
  deviceTokenValue?: string;
  platform: string;
}

export function getLoginMeta() {
  return [
    { key: 'email', required: true },
    // { key: 'role', label: 'role', required: true },
    { key: 'password', required: true },
    { key: 'deviceTokenValue', required: false },
    { key: 'platform', required: false },
  ] as Array<ModelMeta>;
}
