package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.ReminderResponseDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderServiceImpl implements ReminderService {

    private final GuestRepository guestRepository;
    private final VillaRepository villaRepository;

    @Override
    public List<ReminderResponseDto> findActiveReminders() {
        LocalDate today = LocalDate.now();
        List<Guest> activeGuests = guestRepository.findAll().stream()
                .filter(guest -> !"CHECKED_OUT".equalsIgnoreCase(guest.getStayStatus()))
                .filter(guest -> !"Checked Out".equalsIgnoreCase(guest.getStayStatus()))
                .filter(guest -> "OCCUPIED".equalsIgnoreCase(guest.getStayStatus()))
                .filter(guest -> !"14".equals(guest.getVillaNumber()))
                .toList();
        Map<Long, Guest> guestsById = activeGuests.stream()
                .collect(Collectors.toMap(Guest::getId, Function.identity()));
        List<ReminderResponseDto> reminders = new ArrayList<>();

        activeGuests.forEach(guest -> addRentReminder(reminders, guest, today));
        villaRepository.findAll().stream()
                .filter(Villa::isRentable)
                .filter(villa -> !"14".equals(villa.getNumber()))
                .filter(villa -> villa.getPrimaryTenantId() != null)
                .forEach(villa -> addCleaningReminder(reminders, villa, guestsById.get(villa.getPrimaryTenantId()), today));
        activeGuests.forEach(guest -> addCheckoutReminder(reminders, guest, today));

        return reminders.stream()
                .sorted(Comparator.comparing(ReminderResponseDto::overdue).reversed()
                        .thenComparing(ReminderResponseDto::dueDate))
                .toList();
    }

    private void addRentReminder(List<ReminderResponseDto> reminders, Guest guest, LocalDate today) {
        LocalDate dueDate = guest.getNextDueDate() != null ? guest.getNextDueDate() : guest.getCheckInDate();
        if (dueDate == null || dueDate.isAfter(today)) {
            return;
        }
        boolean overdue = dueDate.isBefore(today);
        reminders.add(new ReminderResponseDto(
                "rent-" + guest.getId() + "-" + dueDate,
                overdue ? "RENT_OVERDUE" : "RENT_DUE",
                overdue ? "Rent overdue" : "Rent due",
                guest.getFullName() + " in Villa " + guest.getVillaNumber() + " has rent " + (overdue ? "overdue" : "due today") + ".",
                guest.getId(), guest.getVillaId(), dueDate, overdue));
    }

    private void addCleaningReminder(List<ReminderResponseDto> reminders, Villa villa, Guest primaryTenant, LocalDate today) {
        if (primaryTenant == null) {
            return;
        }
        LocalDate dueDate = villa.getCleaningNextDueDate() != null
                ? villa.getCleaningNextDueDate() : primaryTenant.getCheckInDate();
        if (dueDate == null || dueDate.isAfter(today)) {
            return;
        }
        boolean overdue = dueDate.isBefore(today);
        reminders.add(new ReminderResponseDto(
                "cleaning-" + villa.getId() + "-" + dueDate,
                overdue ? "CLEANING_PAYMENT_OVERDUE" : "CLEANING_PAYMENT_DUE",
                overdue ? "Cleaning payment overdue" : "Cleaning payment due",
                "Cleaning payment for Villa " + villa.getNumber() + " is " + (overdue ? "overdue" : "due today") + ".",
                primaryTenant.getId(), villa.getId(), dueDate, overdue));
    }

    private void addCheckoutReminder(List<ReminderResponseDto> reminders, Guest guest, LocalDate today) {
        LocalDate checkOutDate = guest.getCheckOutDate();
        if (checkOutDate == null || checkOutDate.isAfter(today)) {
            return;
        }
        boolean overdue = checkOutDate.isBefore(today);
        reminders.add(new ReminderResponseDto(
                "checkout-" + guest.getId() + "-" + checkOutDate,
                overdue ? "GUEST_CHECKOUT_OVERDUE" : "GUEST_CHECKOUT_TODAY",
                overdue ? "Guest check-out overdue" : "Guest check-out today",
                guest.getFullName() + " in Villa " + guest.getVillaNumber() + " is due to check out " + (overdue ? "immediately" : "today") + ".",
                guest.getId(), guest.getVillaId(), checkOutDate, overdue));
    }
}
