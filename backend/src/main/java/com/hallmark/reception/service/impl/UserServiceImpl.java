package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.CreateUserRequestDto;
import com.hallmark.reception.dto.UserResponseDto;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.entity.UserRole;
import com.hallmark.reception.exception.ApiException;
import com.hallmark.reception.repository.UserRepository;
import com.hallmark.reception.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUser(CreateUserRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Username already exists");
        }

        User user = User.builder()
        .fullName(request.getFullName())
        .username(request.getUsername())
        .password(passwordEncoder.encode(request.getPassword()))
        .role(UserRole.ROLE_RECEPTIONIST)
        .active(true)
        .build();
        return userRepository.save(user);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
    }

   @Override
public List<UserResponseDto> getAllUsers() {

    return userRepository.findAll()
            .stream()
            .map(user -> UserResponseDto.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .username(user.getUsername())
                    .role(user.getRole())
                    .active(user.isActive())
                    .build())
            .toList();
}
}
