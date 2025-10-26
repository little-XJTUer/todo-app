package com.BellResound.todo_app.controller;

import com.BellResound.todo_app.entity.Todo;
import com.BellResound.todo_app.repository.TodoRepository;
import com.BellResound.todo_app.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private TodoService todoService;

    // 获取所有待办事项
    @GetMapping
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    // 根据ID获取待办事项
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("未找到ID为 " + id + " 的待办事项"));
        return ResponseEntity.ok(todo);
    }

    // 创建新的待办事项
    @PostMapping
    public Todo createTodo(@RequestBody Todo todo) {
        // 设置默认值
        if (todo.getCompleted() == null) {
            todo.setCompleted(false);
        }
        if (todo.getCategory() == null || todo.getCategory().trim().isEmpty()) {
            todo.setCategory("默认");
        }
        if (todo.getPriority() == null) {
            todo.setPriority(2);
        }

        return todoRepository.save(todo);
    }

    // 更新待办事项
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("未找到ID为 " + id + " 的待办事项"));

        // 更新字段
        if (todoDetails.getTask() != null) {
            todo.setTask(todoDetails.getTask());
        }
        if (todoDetails.getCompleted() != null) {
            todo.setCompleted(todoDetails.getCompleted());
        }
        if (todoDetails.getDueDate() != null) {
            todo.setDueDate(todoDetails.getDueDate());
        }
        if (todoDetails.getCategory() != null) {
            todo.setCategory(todoDetails.getCategory());
        }
        if (todoDetails.getPriority() != null) {
            todo.setPriority(todoDetails.getPriority());
        }
        if (todoDetails.getDescription() != null) {
            todo.setDescription(todoDetails.getDescription());
        }

        Todo updatedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(updatedTodo);
    }

    // 删除待办事项
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTodo(@PathVariable Long id) {
        if (todoRepository.existsById(id)) {
            todoRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "待办事项删除成功");
            return ResponseEntity.ok(response);
        } else {
            throw new RuntimeException("未找到ID为 " + id + " 的待办事项");
        }
    }

    // 获取所有分类
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return todoRepository.findAllCategories();
    }

    // 根据分类获取待办事项
    @GetMapping("/category/{category}")
    public List<Todo> getTodosByCategory(@PathVariable String category) {
        return todoRepository.findByCategory(category);
    }

    // 修复：获取今天到期的任务
    @GetMapping("/today")
    public List<Todo> getTodayDueTasks() {
        return todoService.getTodayDueTasks();
    }

    // 修复：获取过期的任务
    @GetMapping("/overdue")
    public List<Todo> getOverdueTasks() {
        return todoService.getOverdueTasks();
    }

    // 根据完成状态获取任务
    @GetMapping("/status/{completed}")
    public List<Todo> getTodosByStatus(@PathVariable Boolean completed) {
        return todoRepository.findByCompleted(completed);
    }

    // 修复：获取统计信息
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        TodoService.TodoStats stats = todoService.getStats();
        Map<String, Object> response = new HashMap<>();

        response.put("total", stats.getTotal());
        response.put("completed", stats.getCompleted());
        response.put("pending", stats.getPending());
        response.put("overdue", stats.getOverdue());
        response.put("todayDue", stats.getTodayDue());
        response.put("completionRate", stats.getCompletionRate());

        return response;
    }
}