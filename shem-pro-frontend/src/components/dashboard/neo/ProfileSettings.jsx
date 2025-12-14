import React, { useState, useEffect } from 'react';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import ThemeSwitcher from '../../ThemeSwitcher';

const ProfileSettings = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        homeSize: '',
        occupants: ''
    });
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || 'Guest User',
                email: user.email || '',
                phone: user.phone || '+91 98765 43210',
                homeSize: user.homeSize || '1200',
                occupants: user.occupants || '4'
            });
            setProfileImage(user.photoURL || null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        console.log("Saving profile:", formData, profileImage);
        alert("Profile updated successfully! (Simulation)");
    };

    return (
        <div className="bg-dashboard-card rounded-xl p-8 border border-dashboard-textSecondary/10 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-dashboard-text">Profile Settings</h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${isEditing
                        ? 'bg-dashboard-success text-white hover:opacity-90'
                        : 'bg-accent text-primary-DEFAULT hover:opacity-90'}`}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image Column */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dashboard-textSecondary/10 relative bg-dashboard-bg">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-dashboard-textSecondary" />
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Form Column */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-dashboard-textSecondary">Full Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full bg-dashboard-bg border border-dashboard-textSecondary/20 rounded-lg px-4 py-3 text-dashboard-text focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-dashboard-textSecondary">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full bg-dashboard-bg border border-dashboard-textSecondary/20 rounded-lg px-4 py-3 text-dashboard-text focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-dashboard-textSecondary">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full bg-dashboard-bg border border-dashboard-textSecondary/20 rounded-lg px-4 py-3 text-dashboard-text focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-dashboard-textSecondary">Home Size (sq. ft.)</label>
                        <input
                            type="number"
                            name="homeSize"
                            value={formData.homeSize}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full bg-dashboard-bg border border-dashboard-textSecondary/20 rounded-lg px-4 py-3 text-dashboard-text focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-dashboard-textSecondary/10" />

            <ThemeSwitcher />
        </div>
    );
};

export default ProfileSettings;
