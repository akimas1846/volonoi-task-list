import { useState, useEffect, useCallback, useMemo } from 'react';
import VoronoiChart from './VoronoiChart';
import TaskDetailPanel from './TaskDetailPanel';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // ⬇️ 完了済みを表示するかどうかのステート
  const [showCompleted, setShowCompleted] = useState(true);

  const API_URL = 'http://localhost:8080/api/tasks';

  const fetchTasks = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ⬇️ 表示用データのフィルタリング（メモ化してパフォーマンス最適化）
  const displayedTasks = useMemo(() => {
    return showCompleted ? tasks : tasks.filter(t => !t.isCompleted);
  }, [tasks, showCompleted]);

  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  }, []);

  const handleAddNewTask = useCallback(() => {
    setSelectedTask({
      name: '',
      importance: 5,
      isCompleted: false,
      category: { id: 1 }
    });
    setIsPanelOpen(true);
  }, []);

  return (
    <div className="app-container">
      <main className="main-view">
        <header className="header">
          <h1>Voronoi Task Manager</h1>
          <div className="header-controls">
            {/* ⬇️ 表示切り替えトグル */}
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showCompleted} 
                onChange={() => setShowCompleted(!showCompleted)} 
              />
              <span className="slider"></span>
              <span className="toggle-label">完了済みを表示</span>
            </label>
            
            <button className="add-btn" onClick={handleAddNewTask}>
              <i className="fa-solid fa-plus"></i> 新規タスク
            </button>
          </div>
        </header>

        <VoronoiChart tasks={displayedTasks} onSelectTask={handleSelectTask} />
      </main>

      {isPanelOpen && (
        <TaskDetailPanel 
          task={selectedTask} 
          onClose={() => setIsPanelOpen(false)}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}

export default App;