package com.hallmark.reception.service;

import com.hallmark.reception.dto.VillaRequestDto;
import com.hallmark.reception.entity.Villa;

import java.util.List;

public interface VillaService {
    List<Villa> findAll();
    List<Villa> findAvailable();
    List<Villa> search(String term);
    List<Villa> findByStatus(String status);
    Villa findById(Long id);
    Villa create(VillaRequestDto request);
    Villa update(Long id, VillaRequestDto request);
    Villa markCleaning(Long id);
    Villa markVacant(Long id);
    void delete(Long id);
}
