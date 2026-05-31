package com.example.voronoitask.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_categories")
@Data
public class TaskCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "区分名は必須です")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "色は必須です")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "カラーコードは #RRGGBB 形式である必要があります")
    @Column(nullable = false, length = 7)
    private String color;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;
}