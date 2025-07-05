// Syokuryo.jsx 冷蔵庫断面レイアウト + モバイル対応
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, Trash2 } from 'lucide-react';
import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl } from '@aws-amplify/storage';
import { listFridgeItems } from '../graphql/queries';
import { createFridgeItem, deleteFridgeItem } from '../graphql/mutations';

const client = generateClient();

const fridgeLocations = [
  { id: 'fridge-top', name: '冷蔵室上段', icon: '🥛' },
  { id: 'fridge-middle', name: '冷蔵室中段', icon: '🥗' },
  { id: 'fridge-bottom', name: '冷蔵室下段', icon: '🍖' },
  { id: 'freezer-top', name: '冷凍庫上段', icon: '❄️' },
  { id: 'freezer-middle', name: '冷凍庫中段', icon: '🧊' },
  { id: 'freezer-bottom', name: '冷凍庫下段', icon: '🍦' },
];

const doorPocket = { id: 'door-pocket', name: 'ドアポケット', icon: '🚪' };

export default function Syokuryo() {
  const [urgentItems, setUrgentItems] = useState([]);
  const [locationImages, setLocationImages] = useState({});
  const [imageURLs, setImageURLs] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [selectedLocationForPhoto, setSelectedLocationForPhoto] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchFridgeItems(); }, []);

  useEffect(() => {
    (async () => {
      const urls = {};
      for (const loc of [...fridgeLocations, doorPocket]) {
        const key = locationImages[loc.id];
        if (key) {
          try {
            const { url } = await getUrl({ path: key, options: { accessLevel: 'protected' } });
            urls[loc.id] = url.href;
          } catch (e) {
            console.warn(`画像取得失敗: ${loc.id}`, e);
          }
        }
      }
      setImageURLs(urls);
    })();
  }, [locationImages]);

  const fetchFridgeItems = async () => {
    try {
      const res = await client.graphql({ query: listFridgeItems });
      const items = res.data.listFridgeItems.items.filter(item => item.isUrgent);
      setUrgentItems(items);
      const imgMap = {};
      items.forEach(item => {
        if (item.location && item.image) imgMap[item.location] = item.image;
      });
      setLocationImages(imgMap);
    } catch (err) {
      console.error('取得エラー:', err);
    }
  };

  const handleAddUrgentItem = async () => {
    if (!newItemName.trim()) return;
    try {
      const input = {
        name: newItemName.trim(),
        addedDate: new Date().toISOString().split('T')[0],
        isUrgent: true,
        location: '',
        image: '',
      };
      const res = await client.graphql({ query: createFridgeItem, variables: { input } });
      setUrgentItems(prev => [...prev, res.data.createFridgeItem]);
      setNewItemName('');
    } catch (err) {
      console.error('追加失敗:', err);
      alert('登録に失敗しました');
    }
  };

  const handleDeleteUrgentItem = async id => {
    if (!confirm('削除しますか？')) return;
    try {
      await client.graphql({ query: deleteFridgeItem, variables: { input: { id } } });
      setUrgentItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('削除失敗:', err);
      alert('削除に失敗しました');
    }
  };

  const handleImageCapture = async file => {
    if (!file || !selectedLocationForPhoto) return;
    try {
      const filename = `fridge/${selectedLocationForPhoto}_${Date.now()}_${file.name}`;
      const result = await uploadData({ path: filename, data: file, options: { accessLevel: 'protected', contentType: file.type } });
      const key = result?.path ?? filename;
      setLocationImages(prev => ({ ...prev, [selectedLocationForPhoto]: key }));
      setSelectedLocationForPhoto('');
    } catch (error) {
      console.error('画像アップロード失敗:', error);
      alert('画像のアップロードに失敗しました');
    }
  };

  const onFileChange = e => {
    const file = e.target.files?.[0];
    handleImageCapture(file);
  };

  const renderLocationImage = (locId, locName, tall = false) => {
    const src = imageURLs[locId];
    if (src) {
      return (
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <img
            src={src}
            alt={`${locName}の写真`}
            onClick={() => setEnlargedImage({ src, name: locName })}
            style={{
              width: '100%',
              height: tall ? 180 : 100,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
          <button
            onClick={e => {
              e.stopPropagation();
              setLocationImages(prev => ({ ...prev, [locId]: undefined }));
            }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              padding: '2px 6px',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            ×
          </button>
        </div>
      );
    }

    // 写真未登録時：中央カメラボタン
    return (
      <div
        onClick={() => {
          setSelectedLocationForPhoto(locId);
          fileInputRef.current?.click();
        }}
        style={{
          height: tall ? 180 : 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: 4,
          border: '1px dashed #ccc',
          color: '#888',
          cursor: 'pointer',
        }}
      >
        <Camera size={24} />
        <div style={{ marginTop: 4 }}>写真なし</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      <h2>⚠️ 食べないと危険なリスト</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="例：賞味期限切れチーズ" style={{ flex: 1 }} />
        <button onClick={handleAddUrgentItem}>追加</button>
      </div>
      <ul>
        {urgentItems.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {item.name}
            <button onClick={() => handleDeleteUrgentItem(item.id)}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: '2rem' }}>🧊 冷蔵庫ビュー</h2>

      {/* 冷蔵室＋ドアポケット */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}>
        {/* 冷蔵室3段 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: 250 }}>
          {fridgeLocations.filter(l => l.id.includes('fridge')).map(loc => (
            <div key={loc.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{loc.icon} {loc.name}</span>
                <button onClick={() => { setSelectedLocationForPhoto(loc.id); fileInputRef.current?.click(); }}><Camera size={16} /></button>
              </div>
              {renderLocationImage(loc.id, loc.name, true)}
            </div>
          ))}
        </div>

        {/* ドアポケット */}
        <div style={{
          width: 180,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: '2px dashed #888',
          borderRadius: 8,
          padding: '0.5rem',
          background: '#f9f9f9',
        }}>
          <h3 style={{ textAlign: 'center' }}>{doorPocket.icon} ドアポケット</h3>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { setSelectedLocationForPhoto(doorPocket.id); fileInputRef.current?.click(); }}><Camera size={16} /></button>
          </div>
          {renderLocationImage(doorPocket.id, doorPocket.name, true)}
        </div>
      </div>

      {/* 仕切り線 */}
      <hr style={{ borderTop: '1px dashed #aaa', margin: '2rem 0' }} />

      {/* 冷凍庫 */}
      <div style={{ marginTop: '2rem' }}>
        {fridgeLocations.filter(l => l.id.includes('freezer')).map(loc => (
          <div key={loc.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{loc.icon} {loc.name}</span>
              <button onClick={() => { setSelectedLocationForPhoto(loc.id); fileInputRef.current?.click(); }}><Camera size={16} /></button>
            </div>
            {renderLocationImage(loc.id, loc.name, true)}
          </div>
        ))}
      </div>

      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" capture="environment" style={{ display: 'none' }} />

      {/* 拡大モーダル */}
      {enlargedImage && (
        <div onClick={() => setEnlargedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 10000 }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={enlargedImage.src} alt={enlargedImage.name} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
            <button onClick={e => { e.stopPropagation(); setEnlargedImage(null); }} style={{ position: 'absolute', top: -40, right: 0, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' }}><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
