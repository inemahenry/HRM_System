package com.hallmark.reception.repository;

import com.hallmark.reception.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    List<Guest> findByStayStatusContainingIgnoreCase(String stayStatus);
    List<Guest> findByPaymentStatusContainingIgnoreCase(String paymentStatus);
    List<Guest> findByPhoneNumberContaining(String phoneNumber);
}
