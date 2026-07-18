package com.hallmark.reception.service;

import com.hallmark.reception.entity.User;
import com.hallmark.reception.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserContext {

    private final UserRepository userRepository;

    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal.toString())) {
            return null;
        }

        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }
}
