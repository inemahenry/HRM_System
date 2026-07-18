package com.hallmark.reception.dto;

import com.hallmark.reception.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequestDto {

    private String fullName;

    private String username;

    private String password;

}