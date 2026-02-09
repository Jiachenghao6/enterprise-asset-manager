import React, { useState, useEffect } from 'react';
import { X, Package, Code, Layers, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetService } from '../services/assetService';
import { AssetStatus, Asset } from '../types/asset';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    assetToEdit?: Asset | null;
}

type AssetType = 'HARDWARE' | 'SOFTWARE';

/**
 * Modal component for adding or editing an asset.
 * <p>
 * Supports both individual and batch creation of Hardware and Software assets.
 * Dynamically renders form fields based on the selected asset type and mode (single vs. batch).
 * </p>
 *
 * @param {AddAssetModalProps} props - The props for the component.
 */
const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSuccess, assetToEdit }) => {
    const [assetType, setAssetType] = useState<AssetType>('HARDWARE');
    const [isLoading, setIsLoading] = useState(false);

    // Batch mode state
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchQuantity, setBatchQuantity] = useState('1');
    const [serialPrefix, setSerialPrefix] = useState(''); // Only for hardware

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

    /**
     * Resets the form to its initial state.
     */
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
        setAssetType('HARDWARE');
        setIsBatchMode(false);
        setBatchQuantity('1');
        setSerialPrefix('');
    };

    useEffect(() => {
        if (isOpen) {
            if (assetToEdit) {
                // Edit mode: force disable batch mode
                setIsBatchMode(false);

                setName(assetToEdit.name);
                setPurchasePrice(assetToEdit.purchasePrice.toString());
                setPurchaseDate(assetToEdit.purchaseDate);
                setStatus(assetToEdit.status);
                setResidualValue(assetToEdit.residualValue.toString());
                setUsefulLifeYears(assetToEdit.usefulLifeYears.toString());

                if ('serialNumber' in assetToEdit) {
                    setAssetType('HARDWARE');
                    setSerialNumber((assetToEdit as any).serialNumber);
                    setLocation((assetToEdit as any).location);
                    setWarrantyDate((assetToEdit as any).warrantyDate || '');
                } else {
                    setAssetType('SOFTWARE');
                    setLicenseKey((assetToEdit as any).licenseKey);
                    setExpiryDate((assetToEdit as any).expiryDate || '');
                }
            } else {
                resetForm();
            }
        }
    }, [isOpen, assetToEdit]);

    /**
     * Handles the form submission for creating or updating an asset.
     * Supports single and batch creation for both hardware and software assets.
     *
     * @param {React.FormEvent} e - The form event.
     */
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

            if (assetToEdit) {
                // === Update Logic (Single) ===
                const updateData = {
                    ...commonData,
                    ...(assetType === 'HARDWARE'
                        ? { serialNumber, location, warrantyDate: warrantyDate || undefined }
                        : { licenseKey, expiryDate: expiryDate || undefined })
                };
                await assetService.updateAsset(assetToEdit.id, updateData);
                toast.success('Asset updated successfully!');
            } else {
                // === Create Logic ===
                if (isBatchMode) {
                    const qty = parseInt(batchQuantity, 10);

                    if (assetType === 'HARDWARE') {
                        // Hardware Batch
                        await assetService.createBatchHardwareAsset({
                            ...commonData,
                            location,
                            warrantyDate: warrantyDate || undefined,
                            serialNumberPrefix: serialPrefix,
                            quantity: qty
                        });
                        toast.success(`Batch created ${qty} hardware assets!`);
                    } else {
                        // Software Batch
                        await assetService.createBatchSoftwareAsset({
                            ...commonData,
                            licenseKey, // Software batch shares Key
                            expiryDate: expiryDate || undefined,
                            quantity: qty
                        });
                        toast.success(`Batch created ${qty} software licenses!`);
                    }
                } else {
                    // Single Create
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
                }
            }

            if (!assetToEdit) resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save asset:', error);
            toast.error(assetToEdit ? 'Failed to update asset.' : 'Failed to create asset.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {assetToEdit ? 'Edit Asset' : (isBatchMode ? `Batch Import ${assetType === 'HARDWARE' ? 'Hardware' : 'Software'}` : 'Add New Asset')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {!assetToEdit && (
                    <div className="p-6 border-b border-gray-200 space-y-4">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setAssetType('HARDWARE')}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${assetType === 'HARDWARE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <Package className="w-5 h-5" />
                                <span className="font-medium">Hardware</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssetType('SOFTWARE')}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${assetType === 'SOFTWARE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <Code className="w-5 h-5" />
                                <span className="font-medium">Software</span>
                            </button>
                        </div>

                        {/* Batch Mode Toggle (Available for both Hardware and Software) */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded ${isBatchMode ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Batch Entry Mode</p>
                                    <p className="text-xs text-gray-500">
                                        {assetType === 'HARDWARE'
                                            ? 'Generate sequential SNs'
                                            : 'Multiple licenses, same Key'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isBatchMode}
                                    onChange={(e) => setIsBatchMode(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={assetType === 'HARDWARE' ? "e.g. MacBook Pro 16" : "e.g. Adobe Photoshop CC"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                            <input type="number" required step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                            <input type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Residual Value *</label>
                            <input type="number" required step="0.01" value={residualValue} onChange={(e) => setResidualValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years) *</label>
                            <input type="number" required value={usefulLifeYears} onChange={(e) => setUsefulLifeYears(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as AssetStatus)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value={AssetStatus.AVAILABLE}>Available</option>
                            <option value={AssetStatus.ASSIGNED}>Assigned</option>
                            <option value={AssetStatus.BROKEN}>Broken</option>
                            <option value={AssetStatus.REPAIRING}>Repairing</option>
                        </select>
                    </div>

                    {/* Hardware Fields */}
                    {assetType === 'HARDWARE' && (
                        <>
                            {isBatchMode ? (
                                <div className="grid grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-900 mb-1">SN Prefix *</label>
                                        <input type="text" required value={serialPrefix} onChange={(e) => setSerialPrefix(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. MON-" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-900 mb-1">Quantity *</label>
                                        <input type="number" required min="1" max="100" value={batchQuantity} onChange={(e) => setBatchQuantity(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="10" />
                                    </div>
                                    <div className="col-span-2 text-xs text-indigo-700 flex items-center gap-1">
                                        <Copy size={12} />
                                        <span>Will generate: {serialPrefix}001 ...</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                                    <input type="text" required value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SN-XXXXXX" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Office A, Room 101" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Date</label>
                                <input type="date" value={warrantyDate} onChange={(e) => setWarrantyDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </>
                    )}

                    {/* Software Fields */}
                    {assetType === 'SOFTWARE' && (
                        <>
                            {isBatchMode && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <label className="block text-sm font-medium text-indigo-900 mb-1">Quantity *</label>
                                    <input type="number" required min="1" max="500" value={batchQuantity} onChange={(e) => setBatchQuantity(e.target.value)} className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="100" />
                                    <p className="mt-1 text-xs text-indigo-700">Creates {batchQuantity} licenses with the same Key.</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Key *</label>
                                <input type="text" required value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="XXXX-XXXX-XXXX-XXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </>
                    )}

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading} className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 transition-colors">
                            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : (assetToEdit ? 'Save Changes' : (isBatchMode ? `Generate ${batchQuantity} Assets` : 'Create Asset'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetModal;