package com.hallmark.reception.controller;

import com.hallmark.reception.dto.UserResponseDto;
import com.hallmark.reception.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
public List<UserResponseDto> getAllUsers() {
    return userService.getAllUsers();
}
}