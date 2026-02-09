import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { assetService } from '../services/assetService';
import { Asset, UserSummary } from '../types/asset';

interface AssignAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    asset: Asset | null;
}

/**
 * Modal component for assigning an asset to a user.
 * <p>
 * Fetches the list of all users and provides a dropdown to select a user for assignment.
 * When a user is selected and confirmed, the asset's status is updated to ASSIGNED.
 * </p>
 *
 * @param {AssignAssetModalProps} props - The props for the component.
 */
const AssignAssetModal: React.FC<AssignAssetModalProps> = ({ isOpen, onClose, onSuccess, asset }) => {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUserId('');
        }
    }, [isOpen]);

    /**
     * Fetches the list of all users from the backend.
     */
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load user list');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    /**
     * Handles the form submission for assigning the asset to the selected user.
     *
     * @param {React.FormEvent} e - The form event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset || !selectedUserId) return;

        setIsSubmitting(true);
        try {
            await assetService.assignAsset(asset.id, parseInt(selectedUserId));

            toast.success(`Asset assigned successfully!`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Assignment failed', error);
            toast.error('Failed to assign asset.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !asset) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Assign Asset</h2>
                            <p className="text-xs text-gray-500 font-medium">{asset.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select User
                        </label>

                        {isLoadingUsers ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                <Loader2 className="animate-spin w-4 h-4" />
                                Loading users...
                            </div>
                        ) : (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all"
                                >
                                    <option value="" disabled>Choose a user...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} {user.firstname && user.lastname ? `(${user.firstname} ${user.lastname})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            The asset status will automatically change to <span className="font-medium text-blue-600">ASSIGNED</span>.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedUserId}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignAssetModal;