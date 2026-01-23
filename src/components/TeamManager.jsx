import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, MessageCircle, Trash2, Plus, Share2, Bell } from 'lucide-react';
import { useToast } from './ToastProvider';

const TeamManager = ({ assessmentId, currentUserEmail, district, region }) => {
    const { success, error: errorToast, info } = useToast();
    const [collaborators, setCollaborators] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('crop');
    const [loading, setLoading] = useState(false);

    // Check if introduction is complete
    const isIntroComplete = district && region;

    // Roles map to the section IDs in your main App
    const roles = [
        { id: 'crop', label: 'Crop Officer (Section 1)' },
        { id: 'livestock', label: 'Veterinary Officer (Section 2)' },
        { id: 'fisheries', label: 'Fisheries Officer (Section 3)' },
        { id: 'markets', label: 'Commercial Officer (Section 4)' },
    ];

    useEffect(() => {
        if (assessmentId) fetchCollaborators();
    }, [assessmentId]);

    const fetchCollaborators = async () => {
        const { data, error } = await supabase
            .from('assessment_collaborators')
            .select('*')
            .eq('assessment_id', assessmentId);

        if (data) setCollaborators(data);
    };

    const inviteUser = async (e) => {
        e.preventDefault();

        if (!isIntroComplete) {
            errorToast("Please complete the Introduction section (District and Region) before inviting collaborators.");
            return;
        }

        setLoading(true);

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            // Prevent self-invitation
            if (newEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
                errorToast("You cannot invite yourself to collaborate.");
                setLoading(false);
                return;
            }

            // Prevent duplicate invitations for the same assessment
            const isAlreadyInvited = collaborators.some(c => c.email.toLowerCase() === newEmail.toLowerCase());
            if (isAlreadyInvited) {
                errorToast("This user is already a collaborator or has a pending invite for this assessment.");
                setLoading(false);
                return;
            }

            // 1. Add to Database with 'pending' status
            const { error: dbError } = await supabase
                .from('assessment_collaborators')
                .insert([{
                    assessment_id: assessmentId,
                    email: newEmail,
                    role: selectedRole,
                    invited_by: userData?.user?.id,
                    status: 'pending' // Explicitly set to pending
                }]);

            if (dbError) throw dbError;

            const roleLabel = roles.find(r => r.id === selectedRole)?.label;

            // 2. Notify (In-App)
            await supabase.from('notifications').insert([{
                user_email: newEmail,
                message: `You have been invited to collaborate on the ${roleLabel} for ${district} District.`,
            }]);

            // 3. Send real email via Edge Function
            const { data: emailData, error: emailError } = await supabase.functions.invoke('dynamic-processor', {
                body: {
                    email: newEmail,
                    role: roleLabel,
                    district: district,
                    region: region,
                    url: `${window.location.origin}`
                }
            });

            if (emailError) {
                console.error('Email send error:', emailError);
                const errorMsg = emailError.message || JSON.stringify(emailError);
                errorToast(`Invite saved but email failed: ${errorMsg}`);
            } else if (emailData?.error) {
                console.error('Resend API error:', emailData);
                errorToast(`Email failed: ${emailData.error}${emailData.details ? ` - ${JSON.stringify(emailData.details)}` : ''}`);
            } else {
                success(`Invitation sent to ${newEmail} for ${district} District.`);
            }

            // Reset input and refresh list
            setNewEmail('');
            fetchCollaborators();

        } catch (err) {
            console.error('Invite Error:', err);
            errorToast(`Error creating invite: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sendWhatsAppInvite = (collab) => {
        const roleLabel = roles.find(r => r.id === collab.role)?.label;
        const text = `Hello! You have been invited to fill out the *${roleLabel}* for the District Food Security Assessment. Please login to the portal to complete your section.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const sendReminder = async (collab) => {
        info(`Reminder sent to ${collab.email}`);
        await supabase.from('notifications').insert([{
            user_email: collab.email,
            message: `REMINDER: Please complete your section (${collab.role}) for the assessment.`,
        }]);
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to remove this collaborator?')) return;

        const { error } = await supabase
            .from('assessment_collaborators')
            .delete()
            .eq('id', id);

        if (error) {
            errorToast(`Error removing user: ${error.message}`);
        } else {
            success('Collaborator removed.');
            fetchCollaborators();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Manage Team & Permissions</h3>
                    <p className="text-sm text-gray-500">Invite officers to specific sections</p>
                </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={inviteUser} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Officer's Email</label>
                    <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="officer@district.go.ug"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="w-full md:w-64">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign Section</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="w-4 h-4" />
                        Invite
                    </button>
                </div>
            </form>

            {/* Collaborators List */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Active Collaborators</h4>
                {collaborators.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No officers invited yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {collaborators.map((collab) => (
                            <div key={collab.id} className="py-3 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${collab.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                        {collab.email.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900">{collab.email}</p>
                                            {collab.status === 'pending' && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">Pending</span>}
                                        </div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            {roles.find(r => r.id === collab.role)?.label || collab.role}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => sendReminder(collab)}
                                        className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                                        title="Send Reminder"
                                    >
                                        <Bell className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => sendWhatsAppInvite(collab)}
                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Send WhatsApp Invite"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteUser(collab.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Remove User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManager;
