package com.hallmark.reception.repository;

import com.hallmark.reception.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByGuestIdOrderByPaidAtDesc(Long guestId);
}
