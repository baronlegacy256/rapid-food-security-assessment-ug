import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, Shield, Calendar, Save, Loader2, Trash2 } from 'lucide-react';
import { useToast } from './ToastProvider';

const Profile = ({ session, userRole, allSections }) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Get the assigned section title if the user is a collaborator
    const assignedSection = allSections?.find(s => s.id === userRole);
    const roleTitle = userRole === 'owner'
        ? 'District Food Security Officer'
        : `${assignedSection?.title || userRole} Officer`;

    const [profile, setProfile] = useState({
        email: session.user.email,
        full_name: '',
        title: roleTitle || '',
        organization: 'MAAIF - Uganda',
        last_login: session.user.last_sign_in_at
    });

    const handleSave = async () => {
        setLoading(true);
        // In a real app, you would save this to a 'profiles' table in Supabase
        // For now, we'll simulate a save
        await new Promise(resolve => setTimeout(resolve, 1000));
        success('Profile updated successfully!');
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            // 1. Delete user's owned assessments
            await supabase
                .from('assessments')
                .delete()
                .eq('user_id', session.user.id);

            // 2. Delete collaboration entries
            await supabase
                .from('assessment_collaborators')
                .delete()
                .eq('email', session.user.email);

            // 3. Delete notifications
            await supabase
                .from('notifications')
                .delete()
                .eq('user_email', session.user.email);

            // 4. Delete the user from Supabase Auth via Edge Function
            const { data: deleteAuthData, error: deleteAuthError } = await supabase.functions.invoke('delete-user');

            if (deleteAuthError) throw deleteAuthError;

            // 5. Sign out (to clear local terminal/session)
            await supabase.auth.signOut();

            success('Your account and all associated data have been permanently deleted.');
        } catch (err) {
            console.error('Deletion error:', err);
            error(`Failed to delete account data: ${err.message}`);
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 rounded-full border-4 border-white/30 flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                            {profile.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile.email}</h2>
                            <p className="text-blue-100 opacity-90">{roleTitle}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" /> Personal Information
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Official Title</label>
                                <input
                                    type="text"
                                    value={profile.title}
                                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                    placeholder="e.g. Senior Agricultural Officer"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" /> Account Details
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                                    <Mail className="w-4 h-4" />
                                    {profile.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                                    <Shield className="w-4 h-4" />
                                    {profile.organization}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Last sign in: {new Date(profile.last_login).toLocaleDateString()}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md disabled:bg-blue-400"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-red-100">
                        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        Once you delete your account, there is no going back. All your assessments,
                                        captured data, and collaborations will be permanently removed from our systems.
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold text-sm shadow-sm"
                                    >
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Are you absolutely sure?</h3>
                        <p className="text-gray-500 text-center mb-8">
                            This will permanently delete your profile and all associated food security assessment logs.
                            This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete My Account"}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={loading}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
