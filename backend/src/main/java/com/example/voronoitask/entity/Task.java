package com.example.voronoitask.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private TaskCategory category;

    @NotBlank(message = "タスク名は必須です")
    @Column(nullable = false, length = 255)
    private String name;

    @NotNull(message = "重要度は必須です")
    @Min(value = 1, message = "重要度は1以上で指定してください")
    @Max(value = 10, message = "重要度は10以下で指定してください")
    @Column(nullable = false)
    private Integer importance;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private LocalDateTime updatedAt;
}