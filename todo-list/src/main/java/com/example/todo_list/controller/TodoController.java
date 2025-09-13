package com.example.todo_list.controller;


import com.example.todo_list.entity.Todo;

import com.example.todo_list.service.TodoService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/todos")
@RestController
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public List<Todo> todoList(){
        return todoService.findAll();
    }

    @PostMapping
    public Todo createTodo(@RequestBody Todo todoEntity){
        return todoService.save(todoEntity);
    }


    @PatchMapping("/{id}/completed")
    @ResponseStatus(HttpStatus.OK)
    public Todo updateCompleted(
            @PathVariable  Long id,
            @RequestBody Todo todo
    ) {
        return todoService.updateCompleted(id, todo.isCompleted());
    }
}
