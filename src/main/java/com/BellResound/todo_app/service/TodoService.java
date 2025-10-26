package com.BellResound.todo_app.service;

import com.BellResound.todo_app.entity.Todo;
import com.BellResound.todo_app.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    // 获取今天到期的任务（通过代码逻辑而不是数据库查询）
    public List<Todo> getTodayDueTasks() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        return todoRepository.findAll().stream()
                .filter(todo -> !todo.getCompleted())
                .filter(todo -> todo.getDueDate() != null)
                .filter(todo -> {
                    LocalDateTime dueDate = todo.getDueDate();
                    return !dueDate.isBefore(startOfDay) && !dueDate.isAfter(endOfDay);
                })
                .collect(Collectors.toList());
    }

    // 获取过期的任务
    public List<Todo> getOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();

        return todoRepository.findAll().stream()
                .filter(todo -> !todo.getCompleted())
                .filter(todo -> todo.getDueDate() != null)
                .filter(todo -> todo.getDueDate().isBefore(now))
                .collect(Collectors.toList());
    }

    // 获取统计信息
    public TodoStats getStats() {
        List<Todo> allTodos = todoRepository.findAll();
        long total = allTodos.size();
        long completed = allTodos.stream().filter(Todo::getCompleted).count();
        long overdue = getOverdueTasks().size();
        long todayDue = getTodayDueTasks().size();

        return new TodoStats(total, completed, total - completed, overdue, todayDue);
    }

    // 统计信息封装类
    public static class TodoStats {
        private final long total;
        private final long completed;
        private final long pending;
        private final long overdue;
        private final long todayDue;
        private final double completionRate;

        public TodoStats(long total, long completed, long pending, long overdue, long todayDue) {
            this.total = total;
            this.completed = completed;
            this.pending = pending;
            this.overdue = overdue;
            this.todayDue = todayDue;
            this.completionRate = total > 0 ? (double) completed / total * 100 : 0;
        }

        // Getters
        public long getTotal() { return total; }
        public long getCompleted() { return completed; }
        public long getPending() { return pending; }
        public long getOverdue() { return overdue; }
        public long getTodayDue() { return todayDue; }
        public double getCompletionRate() { return completionRate; }
    }
}