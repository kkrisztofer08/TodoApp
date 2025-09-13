package com.example.todo_list.service;

import com.example.todo_list.entity.TodoUser;
import com.example.todo_list.repository.TodoRepository;
import com.example.todo_list.repository.TodoUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TodoUserService {

    private final TodoUserRepository todoUserRepository;

    public TodoUserService(TodoUserRepository todoUserRepository) {
        this.todoUserRepository = todoUserRepository;
    }

    public List<TodoUser> findAll() {
        return todoUserRepository.findAll();
    }

    public Optional<TodoUser> findById(Long id) {
        return todoUserRepository.findById(id);
    }

    public TodoUser save(TodoUser todoUser){
        return todoUserRepository.save(todoUser);
    }

    public void deleteById(Long id){
        todoUserRepository.deleteById(id);
    }

}
