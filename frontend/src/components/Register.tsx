import React, { useState } from 'react';
import { WalletAccount } from '../types';
import {
    Fingerprint,
    User,
    Phone,
    UserPlus,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Trash2,
    Plus,
    Lock
} from 'lucide-react';
import { api } from '../services/api';

interface Member {
    id: string;
    fullName: string;
    phone: string;
    relation: string;
}

interface RegisterProps {
    onRegister: (account: WalletAccount) => void;
    onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBack }) => {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fingerprintScanning, setFingerprintScanning] = useState(false);
    const [fingerprintRegistered, setFingerprintRegistered] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [memberRelation, setMemberRelation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePersonalDetails = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim() || !phone.trim() || !password.trim()) {
            setError('Please fill all required fields');
            return;
        }

        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setStep(2);
    };

    const handleFingerprintScan = async () => {
        setFingerprintScanning(true);
        setError('');

        try {
            // Generate temporary user ID for fingerprint capture
            const tempUserId = '1' + Math.floor(1000 + Math.random() * 9000).toString();

            // Capture fingerprint from backend
            const response = await api.captureFingerprint(tempUserId);

            if (response.success) {
                setFingerprintScanning(false);
                setFingerprintRegistered(true);
                setTimeout(() => setStep(3), 1000);
            } else {
                setFingerprintScanning(false);
                setError(response.error || 'Fingerprint capture failed. Scanner may not be available.');
            }
        } catch (err) {
            setFingerprintScanning(false);
            setError('Fingerprint scanner not available. You can skip this step.');
        }
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();

        if (!memberName.trim() || !memberPhone.trim() || !memberRelation.trim()) {
            setError('Please fill all member details');
            return;
        }

        if (memberPhone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        const newMember: Member = {
            id: Date.now().toString(),
            fullName: memberName,
            phone: memberPhone,
            relation: memberRelation
        };

        setMembers([...members, newMember]);
        setMemberName('');
        setMemberPhone('');
        setMemberRelation('');
        setShowAddMember(false);
        setError('');
    };

    const handleRemoveMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleCompleteRegistration = async () => {
        setLoading(true);
        setError('');

        try {
            // Generate user ID
            const userId = '1' + Math.floor(1000 + Math.random() * 9000).toString();

            // Register user with backend
            const response = await api.registerUser({
                userId,
                name: fullName,
                phone,
                password,
                email: '',
                balance: 0
            });

            if (response.success && response.data) {
                // Convert to WalletAccount format
                const newAccount: WalletAccount = {
                    userId: response.data.userId,
                    fullName: response.data.name,
                    phone: response.data.phone,
                    balance: response.data.balance,
                    fingerprintRegistered: response.data.fingerprintRegistered,
                    transactions: []
                };

                onRegister(newAccount);
            } else {
                setError(response.error || response.message || 'Registration failed');
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-8 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-2xl font-bold">New Registration</h1>
                        <p className="text-blue-100 text-sm">Step {step} of 3</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Personal Details</h2>
                                    <p className="text-sm text-gray-500">Enter your basic information</p>
                                </div>
                            </div>

                            <form onSubmit={handlePersonalDetails} className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mobile Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="10-digit mobile number"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <p className="text-sm text-blue-900 font-semibold mb-2">📱 Why we need this?</p>
                            <p className="text-xs text-blue-700">
                                Your mobile number will be used for account verification and important notifications about your wallet.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Fingerprint Registration */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 transition-all ${fingerprintScanning ? 'bg-blue-100 animate-pulse' :
                                fingerprintRegistered ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                {fingerprintRegistered ? (
                                    <CheckCircle className="w-16 h-16 text-green-600" />
                                ) : (
                                    <Fingerprint className={`w-16 h-16 ${fingerprintScanning ? 'text-blue-600' : 'text-gray-400'
                                        }`} />
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {fingerprintRegistered ? 'Fingerprint Registered!' :
                                    fingerprintScanning ? 'Scanning...' : 'Register Fingerprint'}
                            </h2>

                            <p className="text-gray-500 mb-6">
                                {fingerprintRegistered ? 'Your fingerprint has been successfully registered' :
                                    fingerprintScanning ? 'Please keep your finger on the sensor' :
                                        'Place your finger on the fingerprint sensor'}
                            </p>

                            {/* Error Message */}
                            {error && !fingerprintScanning && (
                                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {!fingerprintRegistered && !fingerprintScanning && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleFingerprintScan}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Fingerprint className="w-5 h-5" />
                                        Start Scanning
                                    </button>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Skip for Now
                                    </button>
                                </div>
                            )}

                            {fingerprintScanning && (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="font-semibold">Processing...</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <p className="text-sm text-amber-900 font-semibold mb-2">🔒 Optional Step</p>
                            <p className="text-xs text-amber-700">
                                Fingerprint registration is optional. You can skip this step and add it later from your profile.
                                Your fingerprint data is encrypted and stored securely.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 3: Add Members (Optional) */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <UserPlus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Add Family Members</h2>
                                        <p className="text-sm text-gray-500">Optional - You can add them later</p>
                                    </div>
                                </div>
                            </div>

                            {/* Members List */}
                            {members.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{member.fullName}</p>
                                                <p className="text-sm text-gray-500">{member.phone} • {member.relation}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Member Form */}
                            {showAddMember ? (
                                <form onSubmit={handleAddMember} className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Member Name
                                        </label>
                                        <input
                                            type="text"
                                            value={memberName}
                                            onChange={(e) => setMemberName(e.target.value)}
                                            placeholder="Enter member name"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={memberPhone}
                                            onChange={(e) => setMemberPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="10-digit mobile number"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Relation
                                        </label>
                                        <select
                                            value={memberRelation}
                                            onChange={(e) => setMemberRelation(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="">Select relation</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Child">Child</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddMember(false);
                                                setError('');
                                            }}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Family Member
                                </button>
                            )}
                        </div>



                        {/* Error Message for Registration Failure */}
                        {error && !showAddMember && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Complete Registration */}
                        <button
                            onClick={handleCompleteRegistration}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Complete Registration
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            You can add or edit members anytime from your profile
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
