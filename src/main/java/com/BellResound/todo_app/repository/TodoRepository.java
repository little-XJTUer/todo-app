package com.BellResound.todo_app.repository;

import com.BellResound.todo_app.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 根据完成状态查询
    List<Todo> findByCompleted(Boolean completed);

    // 根据分类查询
    List<Todo> findByCategory(String category);

    // 根据优先级查询
    List<Todo> findByPriority(Integer priority);

    // 根据分类和完成状态查询
    List<Todo> findByCategoryAndCompleted(String category, Boolean completed);

    // 查询所有分类（去重）
    @Query("SELECT DISTINCT t.category FROM Todo t WHERE t.category IS NOT NULL")
    List<String> findAllCategories();

    // 修复：查询今天到期的任务 - 使用本地查询
    @Query(value = "SELECT * FROM todos t WHERE t.due_date IS NOT NULL AND CAST(t.due_date AS DATE) = CURRENT_DATE AND t.completed = false", nativeQuery = true)
    List<Todo> findTodayDueTasks();

    // 修复：查询过期的任务
    @Query("SELECT t FROM Todo t WHERE t.dueDate IS NOT NULL AND t.dueDate < CURRENT_TIMESTAMP AND t.completed = false")
    List<Todo> findOverdueTasks();

    // 新增：根据日期范围查询
    @Query("SELECT t FROM Todo t WHERE t.dueDate BETWEEN :startDate AND :endDate AND t.completed = false")
    List<Todo> findByDueDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}