import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, Trash2, X, Plus, Clock, Package } from 'lucide-react';

const FridgeInventoryApp = () => {
  const [items, setItems] = useState([
    { 
      id: 1, 
      name: '牛乳', 
      quantity: 1, 
      unit: '本', 
      expiryDate: '2025-07-10', 
      addedDate: '2025-07-01', 
      location: 'door-top',
    },
    { 
      id: 2, 
      name: '卵', 
      quantity: 10, 
      unit: '個', 
      expiryDate: '2025-07-08', 
      addedDate: '2025-07-02', 
      location: 'fridge-middle',
    },
    { 
      id: 3, 
      name: 'にんじん', 
      quantity: 3, 
      unit: '本', 
      expiryDate: '2025-07-07', 
      addedDate: '2025-07-03', 
      location: 'vegetable',
    },
    { 
      id: 4, 
      name: 'レタス', 
      quantity: 1, 
      unit: '玉', 
      expiryDate: '2025-07-06', 
      addedDate: '2025-07-01', 
      location: 'vegetable',
    },
    { 
      id: 5, 
      name: 'ヨーグルト', 
      quantity: 4, 
      unit: '個', 
      expiryDate: '2025-07-09', 
      addedDate: '2025-07-02', 
      location: 'fridge-top',
    },
    { 
      id: 6, 
      name: 'アイスクリーム', 
      quantity: 2, 
      unit: '個', 
      expiryDate: '2025-12-31', 
      addedDate: '2025-07-01', 
      location: 'freezer-top',
    },
  ]);

  const [locationImages, setLocationImages] = useState({
    'fridge-top': null,
    'fridge-middle': null,
    'fridge-bottom': null,
    'vegetable': null,
    'door-top': null,
    'door-middle': null,
    'door-bottom': null,
    'freezer-top': null,
    'freezer-middle': null,
    'freezer-bottom': null,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocationForAdd, setSelectedLocationForAdd] = useState('');
  const [selectedLocationForPhoto, setSelectedLocationForPhoto] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '個',
    expiryDate: '',
    location: ''
  });

  const fileInputRef = useRef(null);
  const units = ['個', '本', 'g', 'kg', 'ml', 'L', '玉', '袋', 'パック'];

  const locations = [
    { id: 'fridge-top', name: '冷蔵室上段', icon: '🥛', color: 'bg-blue-50 border-blue-200' },
    { id: 'fridge-middle', name: '冷蔵室中段', icon: '🥗', color: 'bg-green-50 border-green-200' },
    { id: 'fridge-bottom', name: '冷蔵室下段', icon: '🍖', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'vegetable', name: '野菜室', icon: '🥕', color: 'bg-emerald-50 border-emerald-200' },
    { id: 'door-top', name: 'ドア上段', icon: '🧈', color: 'bg-orange-50 border-orange-200' },
    { id: 'door-middle', name: 'ドア中段', icon: '🥫', color: 'bg-amber-50 border-amber-200' },
    { id: 'door-bottom', name: 'ドア下段', icon: '🍯', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'freezer-top', name: '冷凍庫上段', icon: '❄️', color: 'bg-blue-50 border-blue-200' },
    { id: 'freezer-middle', name: '冷凍庫中段', icon: '🧊', color: 'bg-cyan-50 border-cyan-200' },
    { id: 'freezer-bottom', name: '冷凍庫下段', icon: '🍦', color: 'bg-indigo-50 border-indigo-200' },
  ];

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'warning';
    if (diffDays <= 7) return 'caution';
    return 'fresh';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'expired': return '期限切れ';
      case 'urgent': return '今日中に';
      case 'warning': return '3日以内';
      case 'caution': return '1週間以内';
      default: return '新鮮';
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleImageCapture = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (selectedLocationForPhoto) {
          setLocationImages({
            ...locationImages,
            [selectedLocationForPhoto]: e.target.result
          });
          setSelectedLocationForPhoto('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleImageCapture(file);
  };

  const handlePhotoClick = (locationId) => {
    setSelectedLocationForPhoto(locationId);
    fileInputRef.current?.click();
  };

  const handleLocationClick = (locationId) => {
    setSelectedLocationForAdd(locationId);
    setNewItem({...newItem, location: locationId});
    setShowAddForm(true);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity && newItem.expiryDate && newItem.location) {
      const item = {
        id: Date.now(),
        ...newItem,
        quantity: parseInt(newItem.quantity),
        addedDate: new Date().toISOString().split('T')[0],
      };
      setItems([...items, item]);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewItem({ name: '', quantity: 1, unit: '個', expiryDate: '', location: '' });
    setShowAddForm(false);
    setSelectedLocationForAdd('');
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getItemsForLocation = (locationId) => {
    return items.filter(item => item.location === locationId);
  };

  const urgentItems = items.filter(item => {
    const status = getExpiryStatus(item.expiryDate);
    return status === 'expired' || status === 'urgent' || status === 'warning';
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const allItemsSortedByExpiry = [...items].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">🧊</span>
              我が家の冷蔵庫
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                場所別
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                一覧
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 緊急アラート */}
        {urgentItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-2">期限が近い食材があります！</h3>
              <div className="flex flex-wrap gap-2">
                {urgentItems.map(item => {
                  const days = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <span key={item.id} className="bg-white px-3 py-1 rounded-full text-sm border border-red-200">
                      {item.name} {days < 0 ? `(${Math.abs(days)}日前)` : days === 0 ? '(今日)' : `(あと${days}日)`}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          /* グリッドビュー */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(location => {
              const locationItems = getItemsForLocation(location.id);
              return (
                <div key={location.id} className={`bg-white rounded-lg shadow-sm border-2 ${location.color} overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span className="text-2xl">{location.icon}</span>
                        {location.name}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLocationClick(location.id)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="アイテムを追加"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePhotoClick(location.id)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="写真を撮る"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {locationImages[location.id] && (
                      <div className="mb-3 relative group">
                        <img 
                          src={locationImages[location.id]} 
                          alt={`${location.name}の写真`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setLocationImages({...locationImages, [location.id]: null})}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {locationItems.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">アイテムなし</p>
                      ) : (
                        locationItems.map(item => {
                          const status = getExpiryStatus(item.expiryDate);
                          const days = getDaysUntilExpiry(item.expiryDate);
                          return (
                            <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg border ${getStatusColor(status)}`}>
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-600">
                                  {item.quantity}{item.unit} • 
                                  {days < 0 ? ` ${Math.abs(days)}日前` : days === 0 ? ' 今日' : ` あと${days}日`}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* リストビュー */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                すべての食材 ({items.length}件)
              </h2>
            </div>
            <div className="divide-y">
              {allItemsSortedByExpiry.length === 0 ? (
                <p className="text-gray-400 text-center py-8">食材が登録されていません</p>
              ) : (
                allItemsSortedByExpiry.map(item => {
                  const status = getExpiryStatus(item.expiryDate);
                  const days = getDaysUntilExpiry(item.expiryDate);
                  const location = locations.find(l => l.id === item.location);
                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{location?.icon}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{item.quantity}{item.unit}</span>
                                <span>{location?.name}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  登録: {item.addedDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {days < 0 ? `${Math.abs(days)}日前` : days === 0 ? '今日' : `あと${days}日`}
                          </div>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* 追加フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedLocationForAdd && locations.find(l => l.id === selectedLocationForAdd) && (
                  <>
                    {locations.find(l => l.id === selectedLocationForAdd).icon} 
                    {locations.find(l => l.id === selectedLocationForAdd).name}に追加
                  </>
                )}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">食材名 *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 牛乳"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">消費期限 *</label>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.quantity || !newItem.expiryDate || !newItem.location}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeInventoryApp;