package com.hallmark.reception.repository;

import com.hallmark.reception.entity.Villa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VillaRepository extends JpaRepository<Villa, Long> {
    Optional<Villa> findByNumber(String number);
}
