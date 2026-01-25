import React from 'react';
import { WalletAccount } from '../types';
import {
  Wallet,
  Plus,
  MapPin,
  User,
  Receipt,
  LogOut,
  Fingerprint,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface DashboardProps {
  account: WalletAccount;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ account, onNavigate, onLogout }) => {
  // Calculate balance percentage for visual indicator
  const maxBalance = 1000;
  const balancePercentage = Math.min((account.balance / maxBalance) * 100, 100);

  // Get color based on balance
  const getBalanceColor = () => {
    if (account.balance < 100) return 'text-red-500';
    if (account.balance < 300) return 'text-amber-500';
    return 'text-green-500';
  };

  const getBalanceGradient = () => {
    if (account.balance < 100) return 'from-red-500 to-red-600';
    if (account.balance < 300) return 'from-amber-500 to-amber-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-24 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold">{account.fullName}</h1>
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm w-fit">
              <CreditCard className="w-4 h-4 text-blue-100" />
              <span className="text-blue-100 text-sm font-semibold">ID: {account.userId}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Wallet Balance</p>
                <h2 className={`text-3xl font-bold ${getBalanceColor()}`}>
                  ₹{account.balance}
                </h2>
              </div>
            </div>
            {account.fingerprintRegistered && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <Fingerprint className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Verified</span>
              </div>
            )}
          </div>

          {/* Balance Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Available for travel</span>
              <span>{Math.round(balancePercentage)}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getBalanceGradient()} transition-all duration-500 rounded-full`}
                style={{ width: `${balancePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {account.balance < 100 ? 'Low balance! Recharge soon' :
                account.balance < 300 ? 'Consider recharging your wallet' :
                  'Sufficient balance for travel'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-12">
        <div className="grid grid-cols-2 gap-4">
          {/* Start Travel */}
          <button
            onClick={() => onNavigate('TRAVEL')}
            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <MapPin className="w-7 h-7" />
              </div>
              <span className="font-semibold">Start Travel</span>
            </div>
          </button>

          {/* Recharge Wallet */}
          <button
            onClick={() => onNavigate('RECHARGE')}
            className="bg-white border-2 border-blue-200 text-blue-700 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Plus className="w-7 h-7" />
              </div>
              <span className="font-semibold">Recharge</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Trips</h3>
          {account.transactions.length > 0 && (
            <button
              onClick={() => onNavigate('TRANSACTIONS')}
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              View All
            </button>
          )}
        </div>

        {account.transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-3">
              <Receipt className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No trips yet</p>
            <p className="text-gray-300 text-xs mt-1">Start your first journey!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {account.transactions.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {transaction.pickupLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-8">
                      <div className="w-0.5 h-4 bg-gray-200 ml-2"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="p-1.5 bg-green-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {transaction.dropLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.distance} km</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">-₹{transaction.amount}</p>
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full mt-1">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
          <button className="flex flex-col items-center gap-1 py-2 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => onNavigate('TRAVEL')}
            className="flex flex-col items-center gap-1 py-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 hover:bg-blue-50 rounded-xl transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Travel</span>
          </button>

          <button
            onClick={() => onNavigate('TRANSACTIONS')}
            className="flex flex-col items-center gap-1 py-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 hover:bg-blue-50 rounded-xl transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">History</span>
          </button>

          <button
            onClick={() => onNavigate('PROFILE')}
            className="flex flex-col items-center gap-1 py-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 hover:bg-blue-50 rounded-xl transition-colors">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
