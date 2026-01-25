import React, { useState, useEffect } from 'react';
import { ViewState, WalletAccount, Trip, Transaction } from './types';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Recharge from './components/Recharge';
import Profile from './components/Profile';
import Transactions from './components/Transactions';
import Travel from './components/Travel';
import BusDisplay from './components/BusDisplay';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(null);

  // Auto-login for demo purposes or check for Bus Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'bus') {
      setView('BUS_DISPLAY');
      return;
    }

    const session = sessionStorage.getItem('smartbus_session');
    if (session) {
      setCurrentAccount(JSON.parse(session));
      setView('DASHBOARD');
    }
  }, []);

  const handleLogin = (account: WalletAccount) => {
    setCurrentAccount(account);
    sessionStorage.setItem('smartbus_session', JSON.stringify(account));
    setView('DASHBOARD');
  };

  const handleRegister = (account: WalletAccount) => {
    // In a real app, this would save to backend
    setCurrentAccount(account);
    sessionStorage.setItem('smartbus_session', JSON.stringify(account));
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentAccount(null);
    sessionStorage.removeItem('smartbus_session');
    setView('LOGIN');
  };

  const handleNavigate = (newView: string) => {
    setView(newView as ViewState);
  };

  const handleRecharge = (amount: number) => {
    if (currentAccount) {
      const updatedAccount = {
        ...currentAccount,
        balance: currentAccount.balance + amount
      };
      setCurrentAccount(updatedAccount);
      sessionStorage.setItem('smartbus_session', JSON.stringify(updatedAccount));
    }
  };

  const handleUpdateProfile = (updates: Partial<WalletAccount>) => {
    if (currentAccount) {
      const updatedAccount = {
        ...currentAccount,
        ...updates
      };
      setCurrentAccount(updatedAccount);
      sessionStorage.setItem('smartbus_session', JSON.stringify(updatedAccount));
    }
  };

  const handleTripComplete = (trip: Trip) => {
    if (currentAccount && trip.actualFare) {
      const newTransaction: Transaction = {
        id: trip.id,
        date: new Date().toLocaleDateString('en-IN'),
        pickupLocation: trip.pickupLocation,
        dropLocation: trip.dropLocation || 'Unknown',
        distance: trip.distance,
        amount: trip.actualFare,
        status: 'completed'
      };

      const updatedAccount = {
        ...currentAccount,
        balance: currentAccount.balance - trip.actualFare,
        transactions: [newTransaction, ...currentAccount.transactions]
      };

      setCurrentAccount(updatedAccount);
      sessionStorage.setItem('smartbus_session', JSON.stringify(updatedAccount));
      setView('DASHBOARD');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {view === 'LOGIN' && (
        <Login
          onLogin={handleLogin}
          onNavigateToRegister={() => setView('REGISTER')}
        />
      )}

      {view === 'REGISTER' && (
        <Register
          onRegister={handleRegister}
          onBack={() => setView('LOGIN')}
        />
      )}

      {currentAccount && view === 'DASHBOARD' && (
        <Dashboard
          account={currentAccount}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {currentAccount && view === 'RECHARGE' && (
        <Recharge
          account={currentAccount}
          onRecharge={handleRecharge}
          onBack={() => setView('DASHBOARD')}
        />
      )}

      {currentAccount && view === 'PROFILE' && (
        <Profile
          account={currentAccount}
          onUpdate={handleUpdateProfile}
          onBack={() => setView('DASHBOARD')}
        />
      )}

      {currentAccount && view === 'TRANSACTIONS' && (
        <Transactions
          account={currentAccount}
          onBack={() => setView('DASHBOARD')}
        />
      )}

      {currentAccount && view === 'TRAVEL' && (
        <Travel
          account={currentAccount}
          onTripComplete={handleTripComplete}
          onBack={() => setView('DASHBOARD')}
        />
      )}

      {view === 'BUS_DISPLAY' && (
        <BusDisplay />
      )}
    </div>
  );
};


export default App;
