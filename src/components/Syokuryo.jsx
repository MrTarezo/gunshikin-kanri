
// Syokuryo.jsx - ドアポケットを冷蔵室右に縦長配置（上・中・下・野菜室の横）

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
  { id: 'vegetable', name: '野菜室', icon: '🥕' },
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
      const items = res.data.listFridgeItems.items;
  
      // ⚠️ isUrgent=trueのものだけ urgentItems に
      const urgents = items.filter(item => item.isUrgent);
      setUrgentItems(urgents);
  
      // ✅ location と image があるすべてのレコードを imageMap に登録
      const imgMap = {};
      items.forEach(item => {
        if (item.location && item.image) {
          imgMap[item.location] = item.image;
        }
      });
      setLocationImages(imgMap);
    } catch (err) {
      console.error('取得エラー:', err);
    }
  };
  

  const handleImageCapture = async (file) => {
    if (!file || !selectedLocationForPhoto) return;
  
    const filename = `fridge/${selectedLocationForPhoto}.jpg`;
  
    try {
      // 上書きアップロード
      const result = await uploadData({
        path: filename,
        data: file,
        options: {
          accessLevel: 'protected',
          contentType: file.type,
        },
      });
  
      console.log('✅ 上書きアップロード完了:', result.path);
  
      // 表示用stateに反映
      setLocationImages(prev => ({
        ...prev,
        [selectedLocationForPhoto]: filename,
      }));
  
      // GraphQL登録（先に同じlocationがあってもそのまま追加）
      await client.graphql({
        query: createFridgeItem,
        variables: {
          input: {
            name: '写真のみ',
            location: selectedLocationForPhoto,
            image: filename,
            isUrgent: false,
            addedDate: new Date().toISOString().split('T')[0],
          }
        }
      });
  
      setSelectedLocationForPhoto('');
    } catch (error) {
      console.error('画像アップロード失敗:', error);
      alert('登録エラー: ' + (error.errors?.[0]?.message || ''));
    }
  };
  

  const onFileChange = e => {
    const file = e.target.files?.[0];
    handleImageCapture(file);
  };

  const renderLocationImage = (locId, locName, type = 'normal') => {
    const src = imageURLs[locId];
  
    const height = type === 'door' ? 300 : 180;     // ← 縦長表示！
    const minHeight = type === 'door' ? 250 : 100;  // ← プレースホルダも対応
  
    if (src) {
      return (
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <img
            src={src}
            alt={locName}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedLocationForPhoto(locId);
              fileInputRef.current?.click();
            }}
            style={{
              width: '100%',
              height,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        </div>
      );
    }
  
    return (
      <div
        onClick={() => {
          setSelectedLocationForPhoto(locId);
          fileInputRef.current?.click();
        }}
        style={{
          height,
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
          borderRadius: 4,
          border: '1px dashed #ccc',
          cursor: 'pointer',
        }}
      >
        <Camera size={24} />
        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>写真なし</div>
      </div>
    );
  };
  
  

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      <h2>⚠️ 食べないと危険なリスト</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="例：古いチーズ" style={{ flex: 1 }} />
        <button onClick={() => {
          const input = {
            name: newItemName.trim(),
            addedDate: new Date().toISOString().split('T')[0],
            isUrgent: true,
            location: '',
            image: '',
          };
          client.graphql({ query: createFridgeItem, variables: { input } }).then(res => {
            setUrgentItems(prev => [...prev, res.data.createFridgeItem]);
            setNewItemName('');
          });
        }}>追加</button>
      </div>
      <ul>
        {urgentItems.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            {item.name}
            <button onClick={() => {
              client.graphql({ query: deleteFridgeItem, variables: { input: { id: item.id } } }).then(() =>
                setUrgentItems(prev => prev.filter(i => i.id !== item.id))
              );
            }}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: '2rem' }}>🧊 冷蔵庫ビュー</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fridgeLocations.filter(l => ['fridge-top', 'fridge-middle', 'fridge-bottom', 'vegetable'].includes(l.id)).map(loc => (
            <div key={loc.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{loc.icon} {loc.name}</span>
              </div>
              {renderLocationImage(loc.id, loc.name, true)}
            </div>
          ))}
        </div>
        <div style={{ width: 160, alignSelf: 'flex-start' }}>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            {doorPocket.icon} {doorPocket.name}
          </div>
          {renderLocationImage(doorPocket.id, doorPocket.name, true)}
        </div>
      </div>

      <hr style={{ marginTop: '2rem', marginBottom: '1rem', border: 'none', borderTop: '2px dashed #ccc' }} />
      <h3 style={{ marginTop: '2rem' }}>❄️ 冷凍庫</h3>
      {fridgeLocations.filter(l => l.id.startsWith('freezer')).map(loc => (
        <div key={loc.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{loc.icon} {loc.name}</span>
          </div>
          {renderLocationImage(loc.id, loc.name, true)}
        </div>
      ))}

      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" capture="environment" style={{ display: 'none' }} />

      {enlargedImage && (
        <div onClick={() => setEnlargedImage(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ position: 'relative' }}>
            <img src={enlargedImage.src} alt={enlargedImage.name} style={{ maxHeight: '80vh', maxWidth: '90vw' }} />
            <button onClick={e => { e.stopPropagation(); setEnlargedImage(null); }} style={{
              position: 'absolute', top: -40, right: 0, color: '#fff',
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 4, padding: '0.5rem 1rem'
            }}>
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
