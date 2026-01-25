import React, { useState } from 'react';
import { WalletAccount } from '../types';
import {
    ArrowLeft,
    Wallet,
    CreditCard,
    CheckCircle,
    TrendingUp,
    Zap
} from 'lucide-react';
import { api } from '../services/api';

interface RechargeProps {
    account: WalletAccount;
    onRecharge: (amount: number) => void;
    onBack: () => void;
}

const Recharge: React.FC<RechargeProps> = ({ account, onRecharge, onBack }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');

    const quickAmounts = [100, 200, 500, 1000];

    const paymentModes = [
        { id: 'upi' as const, name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
        { id: 'card' as const, name: 'Card', icon: '💳', desc: 'Credit/Debit Card' },
        { id: 'netbanking' as const, name: 'Net Banking', icon: '🏦', desc: 'All major banks' }
    ];

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        const rechargeAmount = parseInt(amount);

        if (rechargeAmount < 10) {
            alert('Minimum recharge amount is ₹10');
            return;
        }

        setLoading(true);

        try {
            // Call backend API to recharge wallet
            const response = await api.rechargeWallet(account.userId, rechargeAmount);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onRecharge(rechargeAmount);
                    onBack();
                }, 2000);
            } else {
                alert(response.error || 'Recharge failed');
                setLoading(false);
            }
        } catch (err) {
            alert('Failed to connect to server. Please try again.');
            setLoading(false);
        }
    };

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-8 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white text-2xl font-bold">Recharge Wallet</h1>
                </div>

                {/* Current Balance */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1">Current Balance</p>
                    <p className="text-white text-3xl font-bold">₹{account.balance}</p>
                </div>
            </div>

            {/* Recharge Form */}
            <div className="px-6 py-8">
                {!success ? (
                    <form onSubmit={handleRecharge} className="space-y-6">
                        {/* Amount Input */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Enter Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    min="10"
                                    className="w-full pl-12 pr-4 py-4 text-3xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Minimum recharge: ₹10</p>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Select</p>
                            <div className="grid grid-cols-4 gap-3">
                                {quickAmounts.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleQuickAmount(value)}
                                        className={`py-3 rounded-xl font-semibold transition-all ${amount === value.toString()
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        ₹{value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* New Balance Preview */}
                        {amount && parseInt(amount) >= 10 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 mb-1">New Balance</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{account.balance + parseInt(amount)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method Selection */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 mb-4">Select Payment Method</p>
                            <div className="grid grid-cols-1 gap-3">
                                {paymentModes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setPaymentMode(mode.id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMode === mode.id
                                            ? 'bg-blue-50 border-blue-500 shadow-md'
                                            : 'bg-white border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="text-3xl">{mode.icon}</div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-semibold ${paymentMode === mode.id ? 'text-blue-700' : 'text-gray-800'
                                                }`}>
                                                {mode.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{mode.desc}</p>
                                        </div>
                                        {paymentMode === mode.id && (
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recharge Button */}
                        <button
                            type="submit"
                            disabled={loading || !amount || parseInt(amount) < 10}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Recharge Now
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    /* Success Animation */
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Recharge Successful!</h3>
                        <p className="text-gray-500 mb-4">₹{amount} added to your wallet</p>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <p className="text-sm text-green-700 mb-1">New Balance</p>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{account.balance + parseInt(amount)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Recent Recharges */}
                {!success && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Benefits</h3>
                        <div className="space-y-2">
                            {[
                                'Instant wallet top-up',
                                'Secure payment processing',
                                'No hidden charges',
                                'Travel anytime, anywhere'
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recharge;
