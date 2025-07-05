import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, Trash2 } from 'lucide-react';
import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl } from '@aws-amplify/storage';
import { listFridgeItems } from '../graphql/queries';
import { createFridgeItem, deleteFridgeItem } from '../graphql/mutations';
import imageCompression from 'browser-image-compression';

const client = generateClient();

const fridgeLocations = [
  { id: 'fridge-main', name: '冷蔵室', icon: '🍱' },
  { id: 'vegetable', name: '野菜室', icon: '🥕' },
  { id: 'freezer-top', name: '上段', icon: '🍦' },
  { id: 'freezer-middle', name: '中段', icon: '❄️' },
  { id: 'freezer-bottom', name: '下段', icon: '🧊' },
];

const doorPocket = { id: 'door-pocket', name: 'ドア面', icon: '🚪' };

export default function Syokuryo() {
  const [urgentItems, setUrgentItems] = useState([]);
  const [locationImages, setLocationImages] = useState({});
  const [imageURLs, setImageURLs] = useState({});
  const [newItemName, setNewItemName] = useState('');
  const [selectedLocationForPhoto, setSelectedLocationForPhoto] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchFridgeItems();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      const urls = {};
      for (const loc of [...fridgeLocations, doorPocket]) {
        const keyObj = locationImages[loc.id];
        if (keyObj?.preview) {
          try {
            const { url: previewUrl } = await getUrl({ path: keyObj.preview, options: { accessLevel: 'protected' } });
            const { url: originalUrl } = await getUrl({ path: keyObj.original, options: { accessLevel: 'protected' } });
            urls[loc.id] = {
              preview: previewUrl.href,
              original: originalUrl.href,
            };
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
      setFridgeItems(items);

      const urgents = items.filter(item => item.isUrgent);
      setUrgentItems(urgents);

      const imgMap = {};
      items.forEach(item => {
        if (item.location && item.image) {
          imgMap[item.location] = {
            preview: item.image.replace('_original.jpg', '_preview.jpg'),
            original: item.image,
          };
        }
      });
      setLocationImages(imgMap);
    } catch (err) {
      console.error('取得エラー:', err);
    }
  };

  const locationDataMap = {};
  fridgeItems.forEach(item => {
    locationDataMap[item.location] = item;
  });

  const handleImageCapture = async (file) => {
    if (!file || !selectedLocationForPhoto) return;

    const basePath = `fridge/${selectedLocationForPhoto}`;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      await uploadData({
        path: `${basePath}_preview.jpg`,
        data: compressed,
        options: {
          accessLevel: 'protected',
          contentType: compressed.type,
        },
      });

      await uploadData({
        path: `${basePath}_original.jpg`,
        data: file,
        options: {
          accessLevel: 'protected',
          contentType: file.type,
        },
      });

      const listRes = await client.graphql({ query: listFridgeItems });
      const existingItem = listRes.data.listFridgeItems.items.find(item => item.location === selectedLocationForPhoto);

      const input = {
        name: '写真のみ',
        location: selectedLocationForPhoto,
        image: `${basePath}_original.jpg`,
        isUrgent: false,
        addedDate: new Date().toISOString().split('T')[0],
      };

      if (existingItem) {
        await client.graphql({
          query: updateFridgeItem,
          variables: { input: { id: existingItem.id, ...input } },
        });
      } else {
        await client.graphql({ query: createFridgeItem, variables: { input } });
      }

      try {
        const previewUrl = await getUrl({ path: `${basePath}_preview.jpg`, options: { accessLevel: 'protected' } });
        const originalUrl = await getUrl({ path: `${basePath}_original.jpg`, options: { accessLevel: 'protected' } });

        setLocationImages(prev => ({
          ...prev,
          [selectedLocationForPhoto]: {
            preview: `${basePath}_preview.jpg`,
            original: `${basePath}_original.jpg`,
          },
        }));

        setImageURLs(prev => ({
          ...prev,
          [selectedLocationForPhoto]: {
            preview: previewUrl.url.href,
            original: originalUrl.url.href,
          },
        }));
      } catch (e) {
        console.warn('プレビューURL取得失敗', e);
      }

      setSelectedLocationForPhoto('');
      await fetchFridgeItems();
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
    const srcObj = imageURLs[locId];
    const previewSrc = srcObj?.preview;
    const originalSrc = srcObj?.original;
    const height = type === 'door' ? 350 : 220;
    const minHeight = type === 'door' ? 300 : 150;

    if (previewSrc) {
      return (
        <div style={{ position: 'relative' }}>
          <img
            src={previewSrc}
            alt={locName}
            onClick={() => setEnlargedImage({ src: originalSrc, name: locName })}
            style={{ width: '100%', height, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLocationForPhoto(locId);
              fileInputRef.current?.click();
            }}
            style={{
              position: 'absolute', top: 4, right: 4,
              background: 'rgba(255,255,255,0.7)',
              border: 'none', borderRadius: '50%',
              padding: '0.3rem', cursor: 'pointer',
            }}
          >
            <Camera size={16} />
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => {
          setSelectedLocationForPhoto(locId);
          fileInputRef.current?.click();
        }}
        style={{ height, minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: 4, border: '1px dashed #ccc', cursor: 'pointer' }}
      >
        <Camera size={24} />
        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>写真なし</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0.5rem', maxWidth: Math.min(windowWidth - 16, 800), margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>⚠️ スグ食べないと危険な食品リスト</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="例：" style={{ flex: 1 }} />
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

      <h2 style={{ marginTop: '1.5rem', fontSize: '1.3rem', margin: '1rem 0 0.5rem 0', textAlign: 'center', background: '#cfd8dc', padding: '0.5rem', borderRadius: '8px', color: '#455a64' }}>❄️ 冷蔵庫ビュー ❄️</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', padding: '0' }}>
        {/* 冷蔵室 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: 1,
          maxWidth: 300,
          border: '3px solid #78909c',
          borderRadius: 12,
          padding: '0.5rem',
          background: 'linear-gradient(to bottom, #eceff1 0%, #cfd8dc 100%)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}>
      {['fridge-main', 'vegetable'].map(id => {
        const loc = fridgeLocations.find(l => l.id === id);
        return (
          <div key={id}>
          <div style={{ fontWeight:'bold' }}>{loc.icon} {loc.name}</div>
          {locationDataMap[loc.id]?.addedDate && (
            <div style={{ fontSize:'0.8rem', color:'#666', marginBottom:4 }}>
              {locationDataMap[loc.id].addedDate}
            </div>
          )}
            {renderLocationImage(loc.id, loc.name)}
          </div>
        );
      })}

        </div>

        {/* 冷蔵庫の間（スペーサー） */}
        <div style={{ width: 4, background: 'linear-gradient(to right, #666, #999, #666)', borderRadius: '2px' }} />

        {/* ── ドアポケット ────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 120,
          border: '3px solid #607d8b',
          borderRadius: 12,
          padding: '0.5rem',
          background: 'linear-gradient(to bottom, #f5f5f5 0%, #b0bec5 100%)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}>
          {/* タイトル */}
          <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
            {doorPocket.icon} {doorPocket.name}
          </div>

          {/* ★ 日付を 2 行目に追加 ★ */}
          {locationDataMap[doorPocket.id]?.addedDate && (
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
              {locationDataMap[doorPocket.id].addedDate}
            </div>
          )}

          {renderLocationImage(doorPocket.id, doorPocket.name, 'door')}
        </div>



      </div>

      <hr style={{ marginTop: '2rem', marginBottom: '1rem', border: 'none', borderTop: '2px dashed #ccc' }} />
      <h3 style={{ marginTop: '2rem', fontSize: '1.3rem', margin: '1rem 0 0.5rem 0', textAlign: 'center', background: '#bbdefb', padding: '0.5rem', borderRadius: '8px', color: '#0d47a1' }}>🧊 冷凍庫ビュー 🧊</h3>

      {fridgeLocations
        .filter(l => l.id.startsWith('freezer'))
        .map(loc => (
          <div key={loc.id} style={{ 
            marginBottom: '1rem',
            border: '3px solid #64b5f6',
            borderRadius: 12,
            padding: '0.5rem',
            background: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 100%)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
          }}>
            {/* タイトル */}
            <div style={{ fontWeight: 'bold' }}>
              {loc.icon} {loc.name}
            </div>

            {/* ★ 日付を 2 行目に追加 ★ */}
            {locationDataMap[loc.id]?.addedDate && (
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
                {locationDataMap[loc.id].addedDate}
              </div>
            )}

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