package com.hallmark.reception.dto;

import com.hallmark.reception.entity.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {

    private Long id;

    private String fullName;

    private String username;

    private UserRole role;

    private boolean active;
}