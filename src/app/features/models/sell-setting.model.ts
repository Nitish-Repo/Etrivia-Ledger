import { ModelMeta } from '@app/shared-services';

export class AppSettings {
  id?: number;
  tag?: string;
  name?: string;
}

export class SellSettings extends AppSettings {
  // Used to set default sell status of new Sell
  defaultSellStatus?: string;
  manageSellStatus: boolean;
  manageCustomer: boolean;
  manageProduct: boolean;
  manageDiscount: boolean;
  manageGstin: boolean;

  constructor() {
    super();
    this.name = 'sellSettings';
    this.defaultSellStatus = 'Delivered';
    this.manageSellStatus = true;
    this.manageCustomer = true;
    this.manageProduct = true;
    this.manageDiscount = true;
    this.manageGstin = true;
  }
}

export function getSellSettingMeta() {
  return [
    { key: 'defaultSellStatus', label: 'Sell Status Name', required: false },
    {
      key: 'manageSellStatus',
      label: 'Manage Sell Status',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'manageCustomer',
      label: 'Manage Customer',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'manageProduct',
      label: 'Manage Product',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'manageDiscount',
      label: 'Manage Discount',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'manageGstin',
      label: 'Manage Gstin',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    { key: 'tag', label: 'Sell Settings tag', required: false },
    { key: 'name', label: 'Sell Settings', required: false },
    { key: 'id', label: 'Sell Settings Id', required: false },
  ] as Array<ModelMeta>;
}

export class QuickSellSettings extends AppSettings {
  unitPrices: number[];
  manageQuickSell: boolean;

  constructor() {
    super();
    this.name = 'quickSellSettings';
    this.manageQuickSell = false;
    this.unitPrices = [20, 40, 60, 80];
  }
}

export function getQuickSellSettingMeta() {
  return [
    { key: 'unitPrices', label: 'Unit Prices' },
    {
      key: 'manageQuickSell',
      label: 'Manage Quick Sell',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
  ] as Array<ModelMeta>;
}

export class SellPrintSettings extends AppSettings {
  posName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  pinCode?: string;
  state?: string;
  country?: string;
  bankName?: string;
  accountName?: string;
  accontNumber?: string;
  ifscCode?: string;
  upiId?: string;

  constructor() {
    super();
    this.posName = '';
    this.phoneNumber = '';
    this.email = '';
    this.address = '';
    this.logoUrl = '';
    this.pinCode = '';
    this.state = '';
    this.country = '';
  }
}

export function getSellPrintSettingsMeta() {
  return [
    { key: 'posName', label: 'business/shop name', required: false },
    { key: 'phoneNumber', label: 'Phone Number', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'logoUrl', label: 'Logo Url', required: false },
    { key: 'pinCode', label: 'Pincode ', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'bankName', label: 'Bank Name', required: false },
    { key: 'accountName', label: 'Account Name', required: false },
    { key: 'accontNumber', label: 'Accont Number', required: true },
    { key: 'ifscCode', label: 'Ifsc Code', required: false },
    { key: 'upiId', label: 'Upi Id', required: false },
  ] as Array<ModelMeta>;
}

export class DashboardSettings extends AppSettings {
  warnThresholdNumber: number;
  infoThresholdNumber: number;

  constructor() {
    super();
    this.name = 'dashboardSettings';
    this.warnThresholdNumber = 10;
    this.infoThresholdNumber = 25;
  }
}

export function getDashboardSettingMeta() {
  return [
    { key: 'warnThresholdNumber', label: 'Warn thershold' },
    { key: 'infoThresholdNumber', label: 'Info thershold' },
  ] as Array<ModelMeta>;
}
