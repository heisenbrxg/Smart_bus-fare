
export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  userId: string;
  fingerprintRegistered: boolean;
}

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  relation: string;
}

export interface Transaction {
  id: string;
  date: string;
  pickupLocation: string;
  dropLocation: string;
  distance: number;
  amount: number;
  status: 'completed' | 'failed';
}

export interface Trip {
  id: string;
  status: 'ongoing' | 'completed';
  pickupLocation: string;
  pickupTime: string;
  dropLocation?: string;
  dropTime?: string;
  distance: number;
  estimatedFare: number;
  actualFare?: number;
  pickupVerified: boolean;
  dropVerified: boolean;
}

export interface WalletAccount {
  userId: string;
  fullName: string;
  phone: string;
  balance: number;
  fingerprintRegistered: boolean;
  transactions: Transaction[];
  members?: Member[];
  currentTrip?: Trip;
}

export type ViewState =
  | 'LOGIN'
  | 'REGISTER'
  | 'DASHBOARD'
  | 'RECHARGE'
  | 'PROFILE'
  | 'TRANSACTIONS'
  | 'TRAVEL'
  | 'TRIP_ACTIVE'
  | 'BUS_DISPLAY';
