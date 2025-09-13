package com.example.todo_list.service;


import com.example.todo_list.entity.Todo;
import com.example.todo_list.repository.TodoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> findAll(){
        return todoRepository.findAll();
    }


    public Optional<Todo> findById(Long id){
        return todoRepository.findById(id);
    }


    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }

    public void deleteById(Long id){
        todoRepository.deleteById(id);
    }

    public Todo updateCompleted(Long id, boolean completed) {
        Todo todo = todoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Todo not found" + id));

        todo.setCompleted(completed);

        return todoRepository.save(todo);
    }




}
