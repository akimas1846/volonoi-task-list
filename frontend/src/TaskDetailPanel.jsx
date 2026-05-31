import { useState, useEffect } from 'react';

export default function TaskDetailPanel({ task, onClose, onRefresh }) {
  const [name, setName] = useState('');
  const [importance, setImportance] = useState(5);
  const [categoryId, setCategoryId] = useState(1);
  
  const API_URL = 'http://localhost:8080/api/tasks';

  useEffect(() => {
    if (task) {
      setName(task.name || '');
      setImportance(task.importance || 5);
      setCategoryId(task.category?.id || 1);
    }
  }, [task]);

  const handleSave = () => {
    const method = task.id ? 'PUT' : 'POST';
    const url = task.id ? `${API_URL}/${task.id}` : API_URL;

    const payload = {
      name,
      importance: Number(importance),
      category: { id: Number(categoryId) },
      userId: 1
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      onRefresh();
      if (!task.id) onClose();
    });
  };

  const handleToggle = () => {
    fetch(`${API_URL}/${task.id}/toggle`, { method: 'PATCH' }).then(onRefresh);
  };

  const handleDelete = () => {
    if (window.confirm('本当に削除しますか？')) {
      fetch(`${API_URL}/${task.id}`, { method: 'DELETE' }).then(() => {
        onRefresh();
        onClose();
      });
    }
  };

  // ⬇️ タスク名が空（スペースのみも不可）かどうかを判定
  const isNameEmpty = !name.trim();

  return (
    <div className="side-panel">
      <div className="panel-header">
        <h2>{task.id ? 'タスク詳細' : '新規タスク作成'}</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="panel-body">
        <div className="input-group">
          <label>タスク名 <span style={{color: '#e53e3e'}}>*</span></label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="タスクを入力..."
          />
        </div>

        <div className="input-group">
          <label>重要度 (陣地の広さ): {importance}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={importance} 
            onChange={(e) => setImportance(e.target.value)} 
          />
        </div>

        <div className="input-group">
          <label>カテゴリー</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="1">仕事</option>
            <option value="2">プライベート</option>
            <option value="3">スキル学習</option>
          </select>
        </div>

        <div className="action-btns">
          {/* ⬇️ 保存ボタンをラップし、条件に応じてCSSクラスとツールチップ属性を付与 */}
          <div 
            className={`tooltip-wrapper ${isNameEmpty ? 'is-disabled' : ''}`}
            data-error="タスク名が入力されていません"
          >
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={isNameEmpty}
              style={{ width: '100%' }} /* ラッパーの幅いっぱいに広げる */
            >
              <i className="fa-solid fa-floppy-disk"></i> {task.id ? '更新して図を再計算' : '作成する'}
            </button>
          </div>

          {task.id && (
            <>
              <button className="toggle-btn" onClick={handleToggle}>
                {task.isCompleted ? '🔄 未完了に戻す' : '✅ 完了にする'}
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                <i className="fa-solid fa-trash"></i> 削除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}