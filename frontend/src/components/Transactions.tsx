import React, { useState } from 'react';
import { WalletAccount, Transaction } from '../types';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Navigation,
    Receipt,
    Filter,
    TrendingDown
} from 'lucide-react';

interface TransactionsProps {
    account: WalletAccount;
    onBack: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({ account, onBack }) => {
    const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

    const filteredTransactions = account.transactions.filter(t =>
        filter === 'all' ? true : t.status === filter
    );

    const totalSpent = account.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDistance = account.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.distance, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-8 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white text-2xl font-bold">Travel History</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <p className="text-blue-100 text-xs mb-1">Total Trips</p>
                        <p className="text-white text-xl font-bold">{account.transactions.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <p className="text-blue-100 text-xs mb-1">Distance</p>
                        <p className="text-white text-xl font-bold">{totalDistance.toFixed(1)} km</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <p className="text-blue-100 text-xs mb-1">Spent</p>
                        <p className="text-white text-xl font-bold">₹{totalSpent}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'completed'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter('failed')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'failed'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Failed
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="px-6 space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                            <Receipt className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No transactions found</p>
                        <p className="text-gray-300 text-sm mt-1">
                            {filter === 'all'
                                ? 'Start your first journey!'
                                : `No ${filter} transactions`}
                        </p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                )}
            </div>
        </div>
    );
};

const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${transaction.status === 'completed'
                                ? 'bg-green-50'
                                : 'bg-red-50'
                            }`}>
                            <Receipt className={`w-5 h-5 ${transaction.status === 'completed'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Trip #{transaction.id}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500">{transaction.date}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-red-600">-₹{transaction.amount}</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${transaction.status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                            {transaction.status}
                        </span>
                    </div>
                </div>

                {/* Route */}
                <div className="space-y-2">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Pickup</p>
                            <p className="text-sm font-semibold text-gray-800">{transaction.pickupLocation}</p>
                        </div>
                    </div>

                    {/* Connector */}
                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-blue-200 to-green-200 ml-2.5"></div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{transaction.distance} km</span>
                        </div>
                    </div>

                    {/* Drop */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="p-1.5 bg-green-50 rounded-lg">
                                <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Drop</p>
                            <p className="text-sm font-semibold text-gray-800">{transaction.dropLocation}</p>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Distance</p>
                                <p className="text-sm font-bold text-gray-800">{transaction.distance} km</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Fare Rate</p>
                                <p className="text-sm font-bold text-gray-800">
                                    ₹{(transaction.amount / transaction.distance).toFixed(2)}/km
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
