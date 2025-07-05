import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, AlertTriangle, Plus, Trash2 } from 'lucide-react';

const Syokuryo = () => {
  // localStorageから初期データを読み込む
  const [urgentItems, setUrgentItems] = useState(() => {
    const saved = localStorage.getItem('fridgeUrgentItems');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'もやし', addedDate: '2025-01-04' },
      { id: 2, name: '豆腐', addedDate: '2025-01-05' },
    ];
  });

  const [locationImages, setLocationImages] = useState(() => {
    const saved = localStorage.getItem('fridgeLocationImages');
    return saved ? JSON.parse(saved) : {
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
    };
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedLocationForPhoto, setSelectedLocationForPhoto] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'gallery'
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  
  const fileInputRef = useRef(null);

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // データが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('fridgeUrgentItems', JSON.stringify(urgentItems));
  }, [urgentItems]);

  useEffect(() => {
    localStorage.setItem('fridgeLocationImages', JSON.stringify(locationImages));
  }, [locationImages]);

  const locations = [
    { id: 'fridge-top', name: '冷蔵室上段', icon: '🥛' },
    { id: 'fridge-middle', name: '冷蔵室中段', icon: '🥗' },
    { id: 'fridge-bottom', name: '冷蔵室下段', icon: '🍖' },
    { id: 'vegetable', name: '野菜室', icon: '🥕' },
    { id: 'door-top', name: 'ドア上段', icon: '🧈' },
    { id: 'door-middle', name: 'ドア中段', icon: '🥫' },
    { id: 'door-bottom', name: 'ドア下段', icon: '🍯' },
    { id: 'freezer-top', name: '冷凍庫上段', icon: '❄️' },
    { id: 'freezer-middle', name: '冷凍庫中段', icon: '🧊' },
    { id: 'freezer-bottom', name: '冷凍庫下段', icon: '🍦' },
  ];

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

  const handleAddUrgentItem = () => {
    if (newItemName.trim()) {
      const newItem = {
        id: Date.now(),
        name: newItemName.trim(),
        addedDate: new Date().toISOString().split('T')[0]
      };
      setUrgentItems([...urgentItems, newItem]);
      setNewItemName('');
      setShowAddForm(false);
    }
  };

  const handleDeleteUrgentItem = (id) => {
    setUrgentItems(urgentItems.filter(item => item.id !== id));
  };

  const getDaysAgo = (dateString) => {
    const today = new Date();
    const addedDate = new Date(dateString);
    const diffTime = today - addedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 場所セクションをレンダリングする関数
  const renderLocationSection = (locationId, isDoor = false) => {
    const location = locations.find(l => l.id === locationId);
    
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: isDoor ? '8px' : '10px',
        marginBottom: '10px',
        minHeight: isDoor ? '120px' : '150px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: isDoor ? '0.85rem' : '0.95rem'
          }}>
            <span>{location.icon}</span>
            <span style={{ fontWeight: '500' }}>{location.name}</span>
          </div>
          <button
            onClick={() => handlePhotoClick(locationId)}
            className="edit-button"
            style={{
              padding: '4px 8px',
              margin: 0,
              fontSize: '0.8rem'
            }}
            title="写真を撮る"
          >
            <Camera style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {locationImages[locationId] ? (
          <div style={{
            position: 'relative',
            cursor: 'pointer'
          }}>
            <img 
              src={locationImages[locationId]} 
              alt={`${location.name}の写真`}
              onClick={() => setEnlargedImage({ src: locationImages[locationId], name: location.name })}
              style={{
                width: '100%',
                height: isDoor ? '80px' : '100px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLocationImages({...locationImages, [locationId]: null});
              }}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                padding: '2px 6px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div style={{
            height: isDoor ? '80px' : '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            color: '#999',
            fontSize: '0.8rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Image style={{ width: '24px', height: '24px', margin: '0 auto 4px' }} />
              <div>写真なし</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* 使わないとやばい食材リスト */}
      <div className="summary-box" style={{
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
        marginBottom: '1.5rem',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle style={{ width: '1.25rem', height: '1.25rem' }} />
            使わないとやばい食材
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="image-button"
            style={{
              padding: '4px 8px',
              margin: 0,
              fontSize: '0.8rem'
            }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {urgentItems.length === 0 ? (
            <p style={{ 
              color: '#666', 
              textAlign: 'center', 
              margin: '1rem 0',
              fontSize: '0.9rem'
            }}>
              リストに食材がありません
            </p>
          ) : (
            urgentItems.map(item => {
              const daysAgo = getDaysAgo(item.addedDate);
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: daysAgo >= 3 ? '#dc2626' : '#666'
                    }}>
                      {daysAgo === 0 ? '今日登録' : `${daysAgo}日前に登録`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUrgentItem(item.id)}
                    className="delete-button"
                    style={{
                      padding: '0.3rem',
                      margin: 0,
                      fontSize: '0.8rem',
                      minWidth: 'auto'
                    }}
                  >
                    <Trash2 style={{ width: '0.9rem', height: '0.9rem' }} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ビュー切り替えボタン */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        <button
          className={viewMode === 'grid' ? 'select-button' : 'edit-button'}
          onClick={() => setViewMode('grid')}
          style={{ 
            backgroundColor: viewMode === 'grid' ? '#4a90e2' : '#f0f0f0',
            color: viewMode === 'grid' ? 'white' : '#333'
          }}
        >
          冷蔵庫ビュー
        </button>
        <button
          className={viewMode === 'gallery' ? 'select-button' : 'edit-button'}
          onClick={() => setViewMode('gallery')}
          style={{ 
            backgroundColor: viewMode === 'gallery' ? '#4a90e2' : '#f0f0f0',
            color: viewMode === 'gallery' ? 'white' : '#333'
          }}
        >
          写真一覧
        </button>
      </div>

      {viewMode === 'grid' ? (
        /* 冷蔵庫ビュー */
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{
            width: '100%',
            maxWidth: windowWidth < 768 ? '100%' : '600px'
          }}>
            {/* 冷蔵室エリア */}
            <div style={{
              backgroundColor: '#e8e8e8',
              borderRadius: '10px',
              padding: windowWidth < 768 ? '10px' : '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '3px solid #d0d0d0',
              marginBottom: '1rem'
            }}>
              <div style={{
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#555',
                fontSize: windowWidth < 768 ? '0.9rem' : '1rem'
              }}>
                冷蔵室
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                {/* 冷蔵室の3段 */}
                <div style={{ flex: 1 }}>
                  {renderLocationSection('fridge-top')}
                  {renderLocationSection('fridge-middle')}
                  {renderLocationSection('fridge-bottom')}
                </div>
                
                {/* ドアポケット（縦長） */}
                <div style={{
                  width: windowWidth < 768 ? '100px' : '120px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  padding: '8px',
                  border: '2px solid #d8d8d8'
                }}>
                  <div style={{
                    marginBottom: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#555',
                    fontSize: windowWidth < 768 ? '0.8rem' : '0.85rem'
                  }}>
                    ドア
                  </div>
                  {renderLocationSection('door-top', true)}
                  {renderLocationSection('door-middle', true)}
                  {renderLocationSection('door-bottom', true)}
                </div>
              </div>
            </div>
            
            {/* 野菜室エリア */}
            <div style={{
              backgroundColor: '#e8e8e8',
              borderRadius: '10px',
              padding: windowWidth < 768 ? '10px' : '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '3px solid #d0d0d0',
              marginBottom: '1rem'
            }}>
              <div style={{
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#555',
                fontSize: windowWidth < 768 ? '0.9rem' : '1rem'
              }}>
                野菜室
              </div>
              {renderLocationSection('vegetable')}
            </div>
            
            {/* 冷凍庫エリア */}
            <div style={{
              backgroundColor: '#e8e8e8',
              borderRadius: '10px',
              padding: windowWidth < 768 ? '10px' : '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '3px solid #d0d0d0'
            }}>
              <div style={{
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#555',
                fontSize: windowWidth < 768 ? '0.9rem' : '1rem'
              }}>
                冷凍庫
              </div>
              {renderLocationSection('freezer-top')}
              {renderLocationSection('freezer-middle')}
              {renderLocationSection('freezer-bottom')}
            </div>
          </div>
        </div>
      ) : (
        /* 写真一覧ビュー */
        <div className="expense-group">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            padding: '1rem'
          }}>
            {locations.map(location => {
              if (!locationImages[location.id]) return null;
              
              return (
                <div key={location.id} className="expense-card" style={{
                  backgroundColor: '#fff',
                  padding: '1rem',
                  minHeight: 'auto',
                  display: 'block',
                  cursor: 'pointer'
                }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{location.icon}</span>
                    {location.name}
                  </h3>
                  <img 
                    src={locationImages[location.id]} 
                    alt={`${location.name}の写真`}
                    onClick={() => setEnlargedImage({ src: locationImages[location.id], name: location.name })}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              );
            }).filter(Boolean)}
          </div>
          
          {locations.every(location => !locationImages[location.id]) && (
            <p style={{
              textAlign: 'center',
              color: '#999',
              padding: '3rem',
              fontSize: '1rem'
            }}>
              まだ写真が登録されていません
            </p>
          )}
        </div>
      )}

      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* 食材追加フォーム */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div className="summary-box" style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ margin: 0 }}>
                使わないとやばい食材を追加
              </h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                食材名
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddUrgentItem();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="例: もやし"
                autoFocus
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                }}
                className="edit-button"
                style={{ backgroundColor: '#666' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleAddUrgentItem}
                disabled={!newItemName.trim()}
                className="select-button"
                style={{
                  opacity: !newItemName.trim() ? 0.5 : 1,
                  cursor: !newItemName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拡大画像モーダル */}
      {enlargedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999,
          cursor: 'pointer'
        }} onClick={() => setEnlargedImage(null)}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}>
            <img
              src={enlargedImage.src}
              alt={enlargedImage.name}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: 0,
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {enlargedImage.name}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Syokuryo;