import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAuthToken } from '../../context/authToken';
import {
    type PocketBundle,
    type PocketBundleCategory,
    type PocketBundleItem,
} from '../../data/pocketBundles';
import {
    fetchPocketBundles,
    createPocketBundle,
    updatePocketBundle,
    deletePocketBundle,
} from '../../utils/pocketBundleApi';

const CATEGORIES: PocketBundleCategory[] = [
    'All',
    'Popular',
    'Wealth',
    'Tools & Materials',
    'Seasonal',
    'Aesthetic',
    'Custom',
];

const ICONS = [
    'fa-box-open',
    'fa-crown',
    'fa-hammer',
    'fa-palette',
    'fa-fan',
    'fa-ghost',
    'fa-snowflake',
    'fa-chess-rook',
    'fa-seedling',
    'fa-star',
    'fa-wand-magic-sparkles',
    'fa-basket-shopping',
];

const DashboardBundles = () => {
    const [bundles, setBundles] = useState<PocketBundle[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PocketBundleCategory>('All');
    const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Edit/Create Modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<PocketBundle | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState<PocketBundleCategory>('Popular');
    const [formIcon, setFormIcon] = useState('fa-box-open');
    const [formTarget, setFormTarget] = useState<'order' | 'drop'>('order');
    const [formItems, setFormItems] = useState<PocketBundleItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Add Item to Bundle Sub-form
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemCategory, setNewItemCategory] = useState('General');

    // Load bundles
    const loadBundles = useCallback(async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const data = await fetchPocketBundles(token);
            setBundles(data);
        } catch {
            setBundles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBundles();
    }, [loadBundles]);

    const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
        setNotice({ text, type });
        setTimeout(() => setNotice(null), 4000);
    };

    const filteredBundles = useMemo(() => {
        return bundles.filter((b) => {
            const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                b.title.toLowerCase().includes(q) ||
                b.description.toLowerCase().includes(q) ||
                b.items.some((i) => i.name.toLowerCase().includes(q));

            return matchesCat && matchesSearch;
        });
    }, [bundles, selectedCategory, searchQuery]);

    const openCreateModal = () => {
        setEditingBundle(null);
        setFormTitle('');
        setFormDescription('');
        setFormCategory('Popular');
        setFormIcon('fa-box-open');
        setFormTarget('order');
        setFormItems([
            { itemId: '3438', name: 'Nook Miles Ticket', quantity: 20, category: 'Currency' },
            { itemId: '1431', name: 'Royal Crown', quantity: 20, category: 'Clothing' },
        ]);
        setEditModalOpen(true);
    };

    const openEditModal = (bundle: PocketBundle) => {
        setEditingBundle(bundle);
        setFormTitle(bundle.title);
        setFormDescription(bundle.description);
        setFormCategory(bundle.category);
        setFormIcon(bundle.icon);
        setFormTarget(bundle.target || 'order');
        setFormItems([...bundle.items]);
        setEditModalOpen(true);
    };

    const handleAddItemToForm = () => {
        if (!newItemName.trim()) return;
        const newItem: PocketBundleItem = {
            itemId: newItemName.toLowerCase().replace(/\s+/g, '_'),
            name: newItemName.trim(),
            quantity: Math.max(1, newItemQuantity),
            category: newItemCategory,
        };
        setFormItems([...formItems, newItem]);
        setNewItemName('');
        setNewItemQuantity(1);
    };

    const handleRemoveItemFromForm = (index: number) => {
        setFormItems(formItems.filter((_, i) => i !== index));
    };

    const handleSaveBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) {
            showNotice('Title is required', 'error');
            return;
        }
        if (formItems.length === 0) {
            showNotice('Bundle must contain at least 1 item', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const token = getAuthToken();
            if (editingBundle) {
                await updatePocketBundle(
                    editingBundle.id,
                    {
                        title: formTitle.trim(),
                        description: formDescription.trim(),
                        category: formCategory,
                        icon: formIcon,
                        target: formTarget,
                        items: formItems,
                        isOfficial: true,
                    },
                    token
                );
                showNotice('Official Bundle updated successfully!');
            } else {
                await createPocketBundle(
                    {
                        title: formTitle.trim(),
                        description: formDescription.trim(),
                        category: formCategory,
                        icon: formIcon,
                        target: formTarget,
                        items: formItems,
                        isOfficial: true,
                    },
                    token
                );
                showNotice('Official Bundle created in database!');
            }
            setEditModalOpen(false);
            await loadBundles();
        } catch {
            showNotice('Failed to save bundle.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this bundle from the database?')) return;
        try {
            await deletePocketBundle(id, getAuthToken());
            showNotice('Bundle deleted from database.');
            await loadBundles();
        } catch {
            showNotice('Failed to delete bundle.', 'error');
        }
    };

    const handleExportJson = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundles, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `chopaeng_pocket_bundles_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showNotice('Bundles exported as JSON backup.');
    };

    return (
        <div className="container-fluid p-4">
            <Helmet>
                <title>Dashboard | Pocket Bundles Management</title>
            </Helmet>

            {/* Header */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 fw-black text-dark mb-1 ac-font">
                        <i className="fa-solid fa-boxes-stacked text-success me-2"></i>
                        Pocket Bundles Management
                    </h1>
                    <p className="small text-muted mb-0">
                        Create, customize, and manage official community 1-click pocket presets in the database.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary rounded-pill fw-bold btn-sm" onClick={handleExportJson}>
                        <i className="fa-solid fa-file-export me-1"></i>
                        Export JSON
                    </button>
                    <button type="button" className="btn btn-nook text-white rounded-pill fw-bold btn-sm shadow-sm" onClick={openCreateModal}>
                        <i className="fa-solid fa-plus me-1"></i>
                        Create Official Bundle
                    </button>
                </div>
            </div>

            {/* Notice */}
            {notice && (
                <div className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-danger'} rounded-4 py-2 px-4 mb-4 fw-bold small animate-fade`}>
                    <i className={`fa-solid ${notice.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2`} />
                    {notice.text}
                </div>
            )}

            {/* Controls */}
            <div className="card rounded-4 border p-3 mb-4 shadow-sm bg-white">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    {/* Category tabs */}
                    <div className="d-flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`btn btn-sm rounded-pill fw-bold px-3 ${
                                    selectedCategory === cat ? 'btn-dark text-white shadow-sm' : 'btn-white border text-muted'
                                }`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="position-relative" style={{ width: '260px' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm rounded-pill ps-4 border"
                            placeholder="Search bundles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted x-small"></i>
                    </div>
                </div>
            </div>

            {/* Bundles Table */}
            <div className="card rounded-4 border overflow-hidden shadow-sm bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '60px' }}>Icon</th>
                                <th>Bundle Title & Description</th>
                                <th>Category</th>
                                <th>Target</th>
                                <th>Items Count</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-muted">
                                        <div className="spinner-border spinner-border-sm text-success me-2" />
                                        Loading database bundles...
                                    </td>
                                </tr>
                            ) : filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-muted">
                                        No pocket bundles found. Click "Create Official Bundle" above to add one!
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((bundle) => {
                                    const totalItemsCount = bundle.items.reduce((s, i) => s + i.quantity, 0);

                                    return (
                                        <tr key={bundle.id}>
                                            <td>
                                                <div
                                                    className="rounded-3 bg-light d-flex align-items-center justify-content-center border"
                                                    style={{ width: '40px', height: '40px' }}
                                                >
                                                    <i className={`fa-solid ${bundle.icon || 'fa-box-open'} text-success fs-5`}></i>
                                                </div>
                                            </td>
                                            <td>
                                                <strong className="d-block text-dark small">{bundle.title}</strong>
                                                <span className="tiny-text text-muted line-clamp-1">{bundle.description}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border rounded-pill x-small">
                                                    {bundle.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill x-small ${bundle.target === 'drop' ? 'bg-info text-dark' : 'bg-nook-green text-white'}`}>
                                                    {bundle.target === 'drop' ? 'Drop Bot (9)' : 'Order Bot (40)'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-muted border rounded-pill x-small">
                                                    {totalItemsCount} items ({bundle.items.length} types)
                                                </span>
                                            </td>
                                            <td>
                                                {bundle.isOfficial ? (
                                                    <span className="badge bg-success-subtle text-success border-success-subtle rounded-pill x-small">
                                                        Official
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill x-small">
                                                        Custom
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary rounded-circle"
                                                        title="Edit bundle"
                                                        onClick={() => openEditModal(bundle)}
                                                    >
                                                        <i className="fa-solid fa-pencil"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger rounded-circle"
                                                        title="Delete bundle"
                                                        onClick={() => handleDelete(bundle.id)}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {editModalOpen && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-5 border-0 shadow-lg overflow-hidden" style={{ background: '#fdfbf7' }}>
                            <div className="modal-header border-0 bg-white px-4 py-3 shadow-sm d-flex align-items-center justify-content-between">
                                <h3 className="h5 fw-black text-dark mb-0 ac-font">
                                    {editingBundle ? 'Edit Official Bundle' : 'Create Official Bundle'}
                                </h3>
                                <button type="button" className="btn-close rounded-circle p-2" onClick={() => setEditModalOpen(false)} />
                            </div>

                            <form onSubmit={handleSaveBundle}>
                                <div className="modal-body p-4">
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Title *</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label small fw-bold text-muted">Category</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={formCategory}
                                                onChange={(e) => setFormCategory(e.target.value as PocketBundleCategory)}
                                            >
                                                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label small fw-bold text-muted">Target</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={formTarget}
                                                onChange={(e) => setFormTarget(e.target.value as 'order' | 'drop')}
                                            >
                                                <option value="order">Order Bot (40 Max)</option>
                                                <option value="drop">Drop Bot (9 Max)</option>
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Description</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={formDescription}
                                                onChange={(e) => setFormDescription(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Icon</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {ICONS.map((ic) => (
                                                    <button
                                                        type="button"
                                                        key={ic}
                                                        className={`btn btn-sm rounded-circle ${formIcon === ic ? 'btn-dark text-white' : 'btn-outline-light text-dark border'}`}
                                                        style={{ width: '36px', height: '36px' }}
                                                        onClick={() => setFormIcon(ic)}
                                                    >
                                                        <i className={`fa-solid ${ic}`}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items list manager */}
                                    <div className="bg-white rounded-4 border p-3 shadow-sm mb-3">
                                        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                            <strong className="small text-dark">Included Items ({formItems.reduce((s, i) => s + i.quantity, 0)} Total Slots)</strong>
                                        </div>

                                        {/* Add new item row */}
                                        <div className="row g-2 align-items-center mb-3">
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm rounded-pill"
                                                    placeholder="Item Name (e.g. Royal Crown)"
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm rounded-pill"
                                                    placeholder="Category"
                                                    value={newItemCategory}
                                                    onChange={(e) => setNewItemCategory(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={40}
                                                    className="form-control form-control-sm rounded-pill"
                                                    value={newItemQuantity}
                                                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value, 10) || 1)}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-nook text-white rounded-pill w-100 fw-bold"
                                                    onClick={handleAddItemToForm}
                                                >
                                                    <i className="fa-solid fa-plus me-1"></i>Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* List of items */}
                                        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '200px' }}>
                                            {formItems.map((item, idx) => (
                                                <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-dark text-white rounded-pill x-small">×{item.quantity}</span>
                                                        <strong className="small text-dark">{item.name}</strong>
                                                        <span className="tiny-text text-muted">({item.category || 'Item'})</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link text-danger p-0"
                                                        onClick={() => handleRemoveItemFromForm(idx)}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 bg-white px-4 py-3 d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold btn-sm" onClick={() => setEditModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-nook text-white rounded-pill px-4 fw-bold btn-sm shadow-sm" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save to Database'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardBundles;
