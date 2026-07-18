package com.hallmark.reception.service;

import com.hallmark.reception.dto.CreateUserRequestDto;
import com.hallmark.reception.entity.User;

import java.util.List;

public interface UserService {
    User createUser(CreateUserRequestDto request);
    User findByUsername(String username);
    List<User> getAllUsers();
}
