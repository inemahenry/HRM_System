package com.hallmark.reception.service;

import com.hallmark.reception.dto.VillaRequestDto;
import com.hallmark.reception.entity.Villa;

import java.util.List;

public interface VillaService {
    List<Villa> findAll();
    Villa findById(Long id);
    Villa create(VillaRequestDto request);
    Villa update(Long id, VillaRequestDto request);
    void delete(Long id);
}
