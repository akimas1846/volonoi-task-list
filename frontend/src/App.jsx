import { useState, useEffect } from 'react';
import VoronoiChart from './VoronoiChart';
// import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('新規テストタスク');
  const [importance, setImportance] = useState(5);
  const [categoryId, setCategoryId] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = 'http://localhost:8080/api/tasks';

  // ① タスク一覧取得
  const fetchTasks = () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('データ取得エラー:', err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ② タスク追加
  const addTask = () => {
    setErrorMsg('');
    const payload = {
      userId: 1,
      name: taskName,
      importance: importance === '' ? null : Number(importance),
      isCompleted: false,
      category: { id: Number(categoryId) }
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'エラーが発生しました');
        }
        return response.json();
      })
      .then(() => {
        fetchTasks();
      })
      .catch((error) => setErrorMsg(error.message));
  };

  // ③ 完了・未完了のトグル
  const toggleTask = (id) => {
    fetch(`${API_URL}/${id}/toggle`, {
      method: 'PATCH'
    })
      .then((response) => {
        if (!response.ok) throw new Error('ステータス変更に失敗しました');
        fetchTasks(); // 成功したら一覧リロード
      })
      .catch((err) => alert(err.message));
  };

  // ④ タスク削除
  const deleteTask = (id) => {
    if (!window.confirm('このタスクを削除してもよろしいですか？')) return;

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) throw new Error('削除に失敗しました');
        fetchTasks();
      })
      .catch((err) => alert(err.message));
  };

  // ⑤ タスク編集 (簡易的にpromptを使用)
  const editTask = (task) => {
    const newName = window.prompt('新しいタスク名を入力してください', task.name);
    if (newName === null) return; // キャンセルされた場合
    if (newName.trim() === '') {
      alert('タスク名は必須です');
      return;
    }

    const newImportance = window.prompt('新しい重要度(1-10)を入力してください', task.importance);
    if (newImportance === null) return;
    const importanceNum = Number(newImportance);
    if (isNaN(importanceNum) || importanceNum < 1 || importanceNum > 10) {
      alert('重要度は1から10の間で入力してください');
      return;
    }

    const payload = {
      name: newName,
      importance: importanceNum,
      category: task.category // カテゴリは現在のものを引き継ぐ
    };

    fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '編集に失敗しました');
        }
        fetchTasks();
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', padding: '20px', borderRadius: '8px' }}>
      <h1>タスク管理 ボロノイUI</h1>
      
      <VoronoiChart tasks={tasks} />
      
      <hr />

      <h2>① タスクの新規追加</h2>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>タスク名:</label>
        <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ padding: '6px', width: '200px' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>重要度(1-10):</label>
        <input type="number" value={importance} onChange={(e) => setImportance(e.target.value)} style={{ padding: '6px', width: '200px' }} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>タスク区分:</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ padding: '6px', width: '216px' }} >
          <option value="1">1: 仕事 (赤系)</option>
          <option value="2">2: プライベート (緑系)</option>
          <option value="3">3: スキル学習 (青系)</option>
        </select>
      </div>
      <button onClick={addTask} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        DBにタスクを追加する
      </button>

      {errorMsg && <div style={{ color: 'red', marginTop: '10px', fontSize: '0.9em' }}>{errorMsg}</div>}

      <hr />

      <h2>② タスク一覧（操作パネル付き）</h2>
      <div>
        {tasks.map((task) => {
          const categoryName = task.category ? task.category.name : 'なし';
          const categoryColor = task.category ? task.category.color : '#999';

          return (
            <div 
              key={task.id} 
              style={{
                borderLeft: `5px solid ${categoryColor}`,
                padding: '12px',
                margin: '10px 0',
                background: 'white',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: task.isCompleted ? 0.6 : 1 // 完了タスクは少し薄くする
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                    {task.name}
                  </h3>
                  <div style={{ fontSize: '0.9em' }}>重要度: <strong>{task.importance}</strong></div>
                  <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                    区分: <span style={{ backgroundColor: categoryColor, color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{categoryName}</span>
                  </div>
                </div>
                
                {/* 操作ボタン群 */}
                <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                  <button onClick={() => toggleTask(task.id)} style={{ padding: '4px 8px', backgroundColor: task.isCompleted ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {task.isCompleted ? '未完了に戻す' : '完了にする'}
                  </button>
                  <button onClick={() => editTask(task)} style={{ padding: '4px 8px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    編集
                  </button>
                  <button onClick={() => deleteTask(task.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    削除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;