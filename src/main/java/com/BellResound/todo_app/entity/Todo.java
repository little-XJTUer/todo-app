package com.BellResound.todo_app.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "todos")
@Data
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String task;

    @Column(nullable = false)
    private Boolean completed = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 新增：截止时间字段
    private LocalDateTime dueDate;

    // 新增：分类字段
    @Column(length = 50)
    private String category = "默认";

    // 新增：优先级 (1-低, 2-中, 3-高)
    private Integer priority = 2;

    // 新增：描述字段
    @Column(length = 1000)
    private String description;

    // 无参构造函数
    public Todo() {
    }

    // 有参构造函数
    public Todo(String task) {
        this.task = task;
    }

    // 带分类的构造函数
    public Todo(String task, String category) {
        this.task = task;
        this.category = category;
    }
}