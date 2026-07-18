package com.hallmark.reception.service;

import com.hallmark.reception.dto.AuthResponseDto;
import com.hallmark.reception.dto.LoginRequestDto;
import com.hallmark.reception.dto.RegisterRequestDto;

public interface AuthService {
    AuthResponseDto login(LoginRequestDto request);
    AuthResponseDto register(RegisterRequestDto request);
}
