import React, { useState } from 'react';
import { WalletAccount, Member } from '../types';
import {
    ArrowLeft,
    User,
    Phone,
    CreditCard,
    Fingerprint,
    CheckCircle,
    Edit2,
    Save,
    UserPlus,
    Trash2,
    Plus,
    AlertCircle
} from 'lucide-react';

interface ProfileProps {
    account: WalletAccount;
    onUpdate: (updates: Partial<WalletAccount>) => void;
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ account, onUpdate, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(account.fullName);
    const [phone, setPhone] = useState(account.phone);
    const [saving, setSaving] = useState(false);

    // Member management states
    const [showAddMember, setShowAddMember] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [memberName, setMemberName] = useState('');
    const [memberPhone, setMemberPhone] = useState('');
    const [memberRelation, setMemberRelation] = useState('');
    const [members, setMembers] = useState<Member[]>(account.members || []);
    const [error, setError] = useState('');

    const handleSave = () => {
        setSaving(true);

        setTimeout(() => {
            onUpdate({ fullName, phone, members });
            setSaving(false);
            setIsEditing(false);
        }, 1000);
    };

    const handleCancel = () => {
        setFullName(account.fullName);
        setPhone(account.phone);
        setIsEditing(false);
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!memberName.trim() || !memberPhone.trim() || !memberRelation.trim()) {
            setError('Please fill all member details');
            return;
        }

        if (memberPhone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (editingMemberId) {
            // Edit existing member
            const updatedMembers = members.map(m =>
                m.id === editingMemberId
                    ? { ...m, fullName: memberName, phone: memberPhone, relation: memberRelation }
                    : m
            );
            setMembers(updatedMembers);
            onUpdate({ members: updatedMembers });
            setEditingMemberId(null);
        } else {
            // Add new member
            const newMember: Member = {
                id: Date.now().toString(),
                fullName: memberName,
                phone: memberPhone,
                relation: memberRelation
            };
            const updatedMembers = [...members, newMember];
            setMembers(updatedMembers);
            onUpdate({ members: updatedMembers });
        }

        setMemberName('');
        setMemberPhone('');
        setMemberRelation('');
        setShowAddMember(false);
    };

    const handleEditMember = (member: Member) => {
        setMemberName(member.fullName);
        setMemberPhone(member.phone);
        setMemberRelation(member.relation);
        setEditingMemberId(member.id);
        setShowAddMember(true);
        setError('');
    };

    const handleRemoveMember = (id: string) => {
        const updatedMembers = members.filter(m => m.id !== id);
        setMembers(updatedMembers);
        onUpdate({ members: updatedMembers });
    };

    const handleCancelMemberForm = () => {
        setShowAddMember(false);
        setEditingMemberId(null);
        setMemberName('');
        setMemberPhone('');
        setMemberRelation('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-16 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="text-white text-2xl font-bold">My Profile</h1>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <Edit2 className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-semibold">Edit</span>
                        </button>
                    )}
                </div>

                {/* Profile Avatar */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-12 h-12 text-blue-600" />
                        </div>
                        {account.fingerprintRegistered && (
                            <div className="absolute -bottom-1 -right-1 p-2 bg-green-500 rounded-full border-4 border-blue-600">
                                <Fingerprint className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* User Info */}
                    <div className="p-6 space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold"
                                />
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="font-semibold text-gray-800">{account.fullName}</span>
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">
                                Mobile Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold"
                                />
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span className="font-semibold text-gray-800">{account.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* User ID */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">
                                User ID
                            </label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-800">{account.userId}</span>
                                <span className="ml-auto text-xs text-gray-400">Cannot be changed</span>
                            </div>
                        </div>

                        {/* Fingerprint Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">
                                Fingerprint Status
                            </label>
                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${account.fingerprintRegistered
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-amber-50 border-2 border-amber-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <Fingerprint className={`w-5 h-5 ${account.fingerprintRegistered ? 'text-green-600' : 'text-amber-600'
                                        }`} />
                                    <span className={`font-semibold ${account.fingerprintRegistered ? 'text-green-700' : 'text-amber-700'
                                        }`}>
                                        {account.fingerprintRegistered ? 'Registered' : 'Not Registered'}
                                    </span>
                                </div>
                                {account.fingerprintRegistered && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                            </div>
                            {!account.fingerprintRegistered && (
                                <p className="text-xs text-amber-600 mt-2 px-1">
                                    Please register your fingerprint at the nearest bus station
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Family Members Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Family Members</h3>
                                    <p className="text-xs text-gray-500">{members.length} member(s)</p>
                                </div>
                            </div>
                        </div>

                        {/* Members List */}
                        {members.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{member.fullName}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-gray-500">{member.phone}</p>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                    {member.relation}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditMember(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add/Edit Member Form */}
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
                                        onClick={handleCancelMemberForm}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingMemberId ? 'Update' : 'Add'} Member
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
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Total Trips</p>
                        <p className="text-2xl font-bold text-gray-800">{account.transactions.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-800">
                            ₹{account.transactions.reduce((sum, t) => sum + t.amount, 0)}
                        </p>
                    </div>
                </div>

                {/* Security Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Fingerprint className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Secure & Private</p>
                            <p className="text-xs text-blue-700">
                                Your fingerprint data is encrypted and stored securely. We never share your personal information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
