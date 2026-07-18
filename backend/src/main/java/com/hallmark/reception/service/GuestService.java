package com.hallmark.reception.service;

import com.hallmark.reception.dto.GuestRequestDto;
import com.hallmark.reception.entity.Guest;

import java.util.List;

public interface GuestService {
    List<Guest> findAll();
    Guest findById(Long id);
    Guest create(GuestRequestDto request);
    Guest update(Long id, GuestRequestDto request);
    Guest checkIn(Long id, GuestRequestDto request);
    Guest checkOut(Long id);
    void delete(Long id);
}
