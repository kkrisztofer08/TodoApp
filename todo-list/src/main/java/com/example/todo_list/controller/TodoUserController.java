package com.example.todo_list.controller;


import com.example.todo_list.entity.TodoUser;
import com.example.todo_list.service.TodoUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/todouser")
@RestController
public class TodoUserController {

    private final TodoUserService todoUserService;


    public TodoUserController(TodoUserService todoUserService) {
        this.todoUserService = todoUserService;
    }

    @GetMapping
    public List<TodoUser> getTodoUsers(){
        return todoUserService.findAll();
    }

    @PostMapping
    public TodoUser addUser(@RequestBody TodoUser todoUser){
        return todoUserService.save(todoUser);
    }
}
