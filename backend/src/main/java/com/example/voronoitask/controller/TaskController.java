package com.example.voronoitask.controller;

import com.example.voronoitask.entity.Task;
import com.example.voronoitask.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    // ① 一覧取得
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findByUserId(1L);
    }

    // ② 追加（作成）
    @PostMapping
    public Task createTask(@Valid @RequestBody Task task) {
        if (task.getUserId() == null) {
            task.setUserId(1L);
        }
        return taskRepository.save(task);
    }

    // ③ 編集（全体更新）
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setName(taskDetails.getName());
                    task.setImportance(taskDetails.getImportance());
                    if (taskDetails.getCategory() != null) {
                        task.setCategory(taskDetails.getCategory());
                    }
                    Task updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(updatedTask);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ④ 完了・未完了の切り替え（部分更新）
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskCompletion(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    // 現在のステータスを反転させる
                    task.setIsCompleted(!task.getIsCompleted());
                    Task updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(updatedTask);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ⑤ 削除
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}