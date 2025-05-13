// src/components/ActionModal.jsx
import Modal from 'react-modal';

export default function ActionModal({ isOpen, onRequestClose, item, onEdit, onDelete, onViewImage }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="操作選択"
      ariaHideApp={false}
      style={{
        content: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '400px',
          width: '90vw',
          maxHeight: '100vh',
          overflow: 'auto',
          padding: '1.5rem',
          borderRadius: '12px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
      }}
    >
      <h2>操作選択</h2>
      <div className="button-row">
        <button className="edit-button" onClick={onEdit}>編集</button>
        <button className="delete-button" onClick={onDelete}>削除</button>
        {item?.receipt && (
          <button className="image-button" onClick={onViewImage}>画像</button>
        )}
        <button onClick={onRequestClose}>閉じる</button>
      </div>
    </Modal>
  );
}
