import React, { useState } from 'react';
import { X, Package, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetService } from '../services/assetService';
import { AssetStatus } from '../types/asset';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type AssetType = 'HARDWARE' | 'SOFTWARE';

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [assetType, setAssetType] = useState<AssetType>('HARDWARE');
    const [isLoading, setIsLoading] = useState(false);

    // Common fields
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [status, setStatus] = useState<AssetStatus>(AssetStatus.AVAILABLE);
    const [residualValue, setResidualValue] = useState('');
    const [usefulLifeYears, setUsefulLifeYears] = useState('');

    // Hardware-specific fields
    const [serialNumber, setSerialNumber] = useState('');
    const [location, setLocation] = useState('');
    const [warrantyDate, setWarrantyDate] = useState('');

    // Software-specific fields
    const [licenseKey, setLicenseKey] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const resetForm = () => {
        setName('');
        setPurchasePrice('');
        setPurchaseDate('');
        setStatus(AssetStatus.AVAILABLE);
        setResidualValue('');
        setUsefulLifeYears('');
        setSerialNumber('');
        setLocation('');
        setWarrantyDate('');
        setLicenseKey('');
        setExpiryDate('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const commonData = {
                name,
                purchasePrice: parseFloat(purchasePrice),
                purchaseDate,
                status,
                residualValue: parseFloat(residualValue),
                usefulLifeYears: parseInt(usefulLifeYears, 10),
            };

            if (assetType === 'HARDWARE') {
                await assetService.createHardwareAsset({
                    ...commonData,
                    type: 'HARDWARE',
                    serialNumber,
                    location,
                    warrantyDate: warrantyDate || undefined,
                });
            } else {
                await assetService.createSoftwareAsset({
                    ...commonData,
                    type: 'SOFTWARE',
                    licenseKey,
                    expiryDate: expiryDate || undefined,
                });
            }

            toast.success('Asset created successfully!');
            resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create asset:', error);
            toast.error('Failed to create asset. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Asset</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Asset Type Selector */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setAssetType('HARDWARE')}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${assetType === 'HARDWARE'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Package className="w-5 h-5" />
                            <span className="font-medium">Hardware</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAssetType('SOFTWARE')}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${assetType === 'SOFTWARE'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Code className="w-5 h-5" />
                            <span className="font-medium">Software</span>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., MacBook Pro 16"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                            <input
                                type="date"
                                required
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Residual Value *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={residualValue}
                                onChange={(e) => setResidualValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years) *</label>
                            <input
                                type="number"
                                required
                                value={usefulLifeYears}
                                onChange={(e) => setUsefulLifeYears(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as AssetStatus)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={AssetStatus.AVAILABLE}>Available</option>
                            <option value={AssetStatus.ASSIGNED}>Assigned</option>
                            <option value={AssetStatus.BROKEN}>Broken</option>
                            <option value={AssetStatus.REPAIRING}>Repairing</option>
                        </select>
                    </div>

                    {/* Hardware-specific Fields */}
                    {assetType === 'HARDWARE' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                                <input
                                    type="text"
                                    required
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="SN-XXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Office A, Room 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Date</label>
                                <input
                                    type="date"
                                    value={warrantyDate}
                                    onChange={(e) => setWarrantyDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Software-specific Fields */}
                    {assetType === 'SOFTWARE' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Key *</label>
                                <input
                                    type="text"
                                    required
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating...' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetModal;
