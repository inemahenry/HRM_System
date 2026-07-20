package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.GuestRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.exception.ApiException;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.AuthenticatedUserContext;
import com.hallmark.reception.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private static final String BOOKED = "BOOKED";
    private static final String OCCUPIED = "OCCUPIED";
    private static final String CHECKED_OUT = "CHECKED_OUT";
    private static final String FIXED_STAY = "FIXED_STAY";
    private static final String OPEN_STAY = "OPEN_STAY";
    private static final LocalDate OPEN_STAY_END_DATE = LocalDate.of(9999, 12, 31);

    private final GuestRepository guestRepository;
    private final VillaRepository villaRepository;
    private final AuthenticatedUserContext authenticatedUserContext;

    @Override
    public List<Guest> findAll() {
        activateDueBookings();
        return guestRepository.findAll().stream()
                .filter(this::isReceptionGuest)
                .toList();
    }

    @Override
    public Guest findById(Long id) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + id));
        if (!isReceptionGuest(guest)) {
            throw new ResourceNotFoundException("Guest not found with id " + id);
        }
        return guest;
    }

    @Override
    public Guest create(GuestRequestDto request) {
        User currentUser = authenticatedUserContext.currentUser();
        LocalDate checkInDate = request.getCheckInDate() != null ? request.getCheckInDate() : LocalDate.now();
        String stayType = normalizeStayType(request.getStayType());
        LocalDate checkOutDate = normalizeCheckOutDate(checkInDate, request.getCheckOutDate(), stayType);
        validateVillaAvailability(request.getVillaId(), checkInDate, checkOutDate, stayType, null, true);
        boolean booked = checkInDate.isAfter(LocalDate.now());
        Guest guest = Guest.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .idNumber(request.getIdNumber())
                .nationality(request.getNationality())
                .email(request.getEmail())
                .stayStatus(booked ? BOOKED : OCCUPIED)
                .stayType(stayType)
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "DUE")
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .amountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO)
                .remainingBalance(request.getRemainingBalance() != null ? request.getRemainingBalance() : BigDecimal.ZERO)
                .villaId(request.getVillaId())
                .villaNumber(request.getVillaNumber())
                .notes(request.getNotes())
                .recordedByName(currentUser != null ? currentUser.getFullName() : null)
                .recordedByUsername(currentUser != null ? currentUser.getUsername() : null)
                .nextDueDate(checkInDate)
                .build();

        Guest saved = guestRepository.save(guest);
        if (!booked) {
            applyVillaAssignment(saved, true);
        }
        return guestRepository.save(saved);
    }

    @Override
    public Guest update(Long id, GuestRequestDto request) {
        User currentUser = authenticatedUserContext.currentUser();
        Guest guest = findById(id);
        Long previousVillaId = guest.getVillaId();
        boolean wasCheckedOut = isCheckedOut(guest);
        String stayType = normalizeStayType(request.getStayType());
        LocalDate checkOutDate = normalizeCheckOutDate(request.getCheckInDate(), request.getCheckOutDate(), stayType);
        boolean checkoutChanged = !Objects.equals(guest.getCheckOutDate(), checkOutDate);
        validateVillaAvailability(request.getVillaId(), request.getCheckInDate(), checkOutDate, stayType, id, false);
        guest.setFullName(request.getFullName());
        guest.setPhoneNumber(request.getPhoneNumber());
        guest.setIdNumber(request.getIdNumber());
        guest.setNationality(request.getNationality());
        guest.setEmail(request.getEmail());
        boolean booked = request.getCheckInDate().isAfter(LocalDate.now());
        guest.setStayStatus(wasCheckedOut ? CHECKED_OUT : booked ? BOOKED : OCCUPIED);
        guest.setStayType(stayType);
        guest.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : guest.getPaymentStatus());
        guest.setCheckInDate(request.getCheckInDate());
        guest.setCheckOutDate(checkOutDate);
        guest.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : guest.getTotalAmount());
        guest.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : guest.getAmountPaid());
        guest.setRemainingBalance(request.getRemainingBalance() != null ? request.getRemainingBalance() : guest.getRemainingBalance());
        guest.setVillaId(request.getVillaId());
        guest.setVillaNumber(request.getVillaNumber());
        guest.setNotes(request.getNotes());
        guest.setRecordedByName(currentUser != null ? currentUser.getFullName() : guest.getRecordedByName());
        guest.setRecordedByUsername(currentUser != null ? currentUser.getUsername() : guest.getRecordedByUsername());
        if (!wasCheckedOut && stayType.equals(FIXED_STAY) && checkoutChanged) {
            guest.setNextDueDate(checkOutDate);
        }
        Guest saved = guestRepository.save(guest);
        if (previousVillaId != null && (!previousVillaId.equals(saved.getVillaId()) || booked || wasCheckedOut)) {
            refreshVillaOccupancy(previousVillaId);
        }
        if (!booked && !wasCheckedOut) {
            applyVillaAssignment(saved, false);
        }
        return saved;
    }

    @Override
    public Guest checkIn(Long id, GuestRequestDto request) {
        User currentUser = authenticatedUserContext.currentUser();
        Guest guest = findById(id);
        if (guest.getCheckInDate() != null && guest.getCheckInDate().isAfter(LocalDate.now())) {
            throw new ApiException("This guest is booked for " + guest.getCheckInDate() + " and cannot check in yet.");
        }
        if (request != null) {
            if (request.getFullName() != null) {
                guest.setFullName(request.getFullName());
            }
            if (request.getPhoneNumber() != null) {
                guest.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getIdNumber() != null) {
                guest.setIdNumber(request.getIdNumber());
            }
            if (request.getNationality() != null) {
                guest.setNationality(request.getNationality());
            }
            if (request.getEmail() != null) {
                guest.setEmail(request.getEmail());
            }
            if (request.getPaymentStatus() != null) {
                guest.setPaymentStatus(request.getPaymentStatus());
            }
            if (request.getVillaId() != null) {
                guest.setVillaId(request.getVillaId());
            }
            if (request.getVillaNumber() != null) {
                guest.setVillaNumber(request.getVillaNumber());
            }
            if (request.getNotes() != null) {
                guest.setNotes(request.getNotes());
            }
        }

        guest.setStayStatus(OCCUPIED);
        guest.setRecordedByName(currentUser != null ? currentUser.getFullName() : guest.getRecordedByName());
        guest.setRecordedByUsername(currentUser != null ? currentUser.getUsername() : guest.getRecordedByUsername());
        guest.setCheckInDate(guest.getCheckInDate() != null ? guest.getCheckInDate() : LocalDate.now());
        if (guest.getPaymentStatus() == null || guest.getPaymentStatus().isBlank()) {
            guest.setPaymentStatus("DUE");
        }
        if (guest.getNextDueDate() == null) {
            guest.setNextDueDate(guest.getCheckInDate());
        }
        Guest saved = guestRepository.save(guest);
        applyVillaAssignment(saved, true);
        return saved;
    }

    @Override
    public Guest checkOut(Long id) {
        User currentUser = authenticatedUserContext.currentUser();
        Guest guest = findById(id);
        boolean wasBooked = BOOKED.equalsIgnoreCase(guest.getStayStatus());
        guest.setStayStatus(CHECKED_OUT);
        guest.setRecordedByName(currentUser != null ? currentUser.getFullName() : guest.getRecordedByName());
        guest.setRecordedByUsername(currentUser != null ? currentUser.getUsername() : guest.getRecordedByUsername());
        guest.setCheckOutDate(LocalDate.now());
        if (guest.getRemainingBalance() != null && guest.getRemainingBalance().compareTo(BigDecimal.ZERO) > 0) {
            guest.setPaymentStatus("DUE");
        } else {
            guest.setPaymentStatus("Paid");
        }

        Guest saved = guestRepository.save(guest);
        if (!wasBooked) {
            updateVillaForCheckout(saved);
        }
        return saved;
    }

    @Override
    @Scheduled(cron = "0 0 0 * * *")
    public void activateDueBookings() {
        LocalDate today = LocalDate.now();
        guestRepository.findByStayStatusContainingIgnoreCase(BOOKED).stream()
                .filter(guest -> guest.getCheckInDate() != null && !guest.getCheckInDate().isAfter(today))
                .forEach(guest -> {
                    guest.setStayStatus(OCCUPIED);
                    Guest saved = guestRepository.save(guest);
                    applyVillaAssignment(saved, true);
                });
    }

    @Override
    public void delete(Long id) {
        findById(id);
        throw new ApiException("Guest records are permanent and cannot be deleted.");
    }

    private void applyVillaAssignment(Guest guest, boolean checkIn) {
        if (guest.getVillaId() == null) {
            return;
        }

        Villa villa = villaRepository.findById(guest.getVillaId()).orElse(null);
        if (villa == null) {
            throw new ResourceNotFoundException("Villa not found with id " + guest.getVillaId());
        }
        if (!villa.isRentable()) {
            throw new ApiException("Villa 14 is reserved for housekeepers and cannot be assigned to a guest.");
        }

        List<Guest> activeGuests = activeGuestsForVilla(guest.getVillaId());
        villa.setOccupancy(activeGuests.size());
        villa.setCheckOutDate(null);
        villa.setActive(true);
        villa.setStatus("OCCUPIED");
        if (villa.getPrimaryTenantName() == null || villa.getPrimaryTenantName().isBlank()
                || !activeGuests.stream().anyMatch(activeGuest -> activeGuest.getId().equals(villa.getPrimaryTenantId()))) {
            villa.setPrimaryTenantName(guest.getFullName());
            villa.setPrimaryTenantId(guest.getId());
        }
        villa.setGuestId(villa.getPrimaryTenantId());
        villa.setGuestName(villa.getPrimaryTenantName());
        if (checkIn) {
            villa.setRentStatus("DUE");
            if (villa.getCleaningNextDueDate() == null) {
                villa.setCleaningNextDueDate(guest.getCheckInDate());
                villa.setCleaningPaymentStatus("DUE");
            }
        }
        villaRepository.save(villa);
    }

    private void updateVillaForCheckout(Guest guest) {
        if (guest.getVillaId() == null) {
            return;
        }

        Villa villa = villaRepository.findById(guest.getVillaId()).orElse(null);
        if (villa == null) {
            return;
        }

        List<Guest> otherGuests = activeGuestsForVilla(guest.getVillaId());

        if (otherGuests.isEmpty()) {
            villa.setStatus("CLEANING");
            villa.setOccupancy(0);
            villa.setGuestId(null);
            villa.setGuestName(null);
            villa.setPrimaryTenantId(null);
            villa.setPrimaryTenantName(null);
            villa.setCheckOutDate(LocalDate.now().toString());
        } else {
            villa.setStatus("OCCUPIED");
            villa.setOccupancy(otherGuests.size());
            Guest primaryGuest = otherGuests.getFirst();
            villa.setPrimaryTenantId(primaryGuest.getId());
            villa.setPrimaryTenantName(primaryGuest.getFullName());
            villa.setGuestId(primaryGuest.getId());
            villa.setGuestName(primaryGuest.getFullName());
        }

        villaRepository.save(villa);
    }

    private List<Guest> activeGuestsForVilla(Long villaId) {
        return guestRepository.findAll().stream()
                .filter(candidate -> candidate.getVillaId() != null && candidate.getVillaId().equals(villaId))
                .filter(candidate -> !isCheckedOut(candidate))
                .filter(candidate -> !BOOKED.equalsIgnoreCase(candidate.getStayStatus()))
                .toList();
    }

    private void validateVillaAvailability(Long villaId, LocalDate checkInDate, LocalDate checkOutDate,
                                           String stayType, Long guestIdToIgnore, boolean creatingGuest) {
        if (villaId == null) {
            throw new ApiException("Select a rentable villa.");
        }
        if (checkInDate == null) {
            throw new ApiException("Check-in date is required.");
        }
        if (creatingGuest && checkInDate.isBefore(LocalDate.now())) {
            throw new ApiException("Check-in date cannot be in the past.");
        }

        Villa villa = villaRepository.findById(villaId)
                .orElseThrow(() -> new ResourceNotFoundException("Villa not found with id " + villaId));
        if (!villa.isRentable() || "14".equals(villa.getNumber())) {
            throw new ApiException("Villa 14 is not part of the reception inventory.");
        }

        LocalDate requestedEndDate = expectedEndDate(checkOutDate, stayType);
        boolean overlappingStay = guestRepository.findAll().stream()
                .filter(candidate -> !Objects.equals(candidate.getId(), guestIdToIgnore))
                .filter(candidate -> candidate.getVillaId() != null && candidate.getVillaId().equals(villaId))
                .filter(candidate -> !isCheckedOut(candidate))
                .filter(candidate -> candidate.getCheckInDate() != null)
                .anyMatch(candidate -> candidate.getCheckInDate().isBefore(requestedEndDate)
                        && checkInDate.isBefore(expectedEndDate(candidate.getCheckOutDate(), candidate.getStayType())));
        if (overlappingStay) {
            throw new ApiException("This villa is already booked for the selected dates.");
        }
    }

    private boolean isReceptionGuest(Guest guest) {
        return !"14".equals(guest.getVillaNumber());
    }

    private String normalizeStayType(String stayType) {
        return OPEN_STAY.equalsIgnoreCase(stayType) ? OPEN_STAY : FIXED_STAY;
    }

    private LocalDate normalizeCheckOutDate(LocalDate checkInDate, LocalDate checkOutDate, String stayType) {
        if (OPEN_STAY.equals(stayType)) {
            return null;
        }
        if (checkOutDate == null || checkInDate == null || !checkOutDate.isAfter(checkInDate)) {
            throw new ApiException("Fixed stays require an expected check-out after check-in.");
        }
        return checkOutDate;
    }

    private LocalDate expectedEndDate(LocalDate checkOutDate, String stayType) {
        return OPEN_STAY.equalsIgnoreCase(stayType) || checkOutDate == null ? OPEN_STAY_END_DATE : checkOutDate;
    }

    private boolean isCheckedOut(Guest guest) {
        return CHECKED_OUT.equalsIgnoreCase(guest.getStayStatus())
                || "Checked Out".equalsIgnoreCase(guest.getStayStatus());
    }

    private void refreshVillaOccupancy(Long villaId) {
        Villa villa = villaRepository.findById(villaId).orElse(null);
        if (villa == null) {
            return;
        }

        List<Guest> activeGuests = activeGuestsForVilla(villaId);
        if (activeGuests.isEmpty()) {
            villa.setStatus("VACANT");
            villa.setOccupancy(0);
            villa.setGuestId(null);
            villa.setGuestName(null);
            villa.setPrimaryTenantId(null);
            villa.setPrimaryTenantName(null);
        } else {
            Guest primaryGuest = activeGuests.getFirst();
            villa.setStatus("OCCUPIED");
            villa.setOccupancy(activeGuests.size());
            villa.setGuestId(primaryGuest.getId());
            villa.setGuestName(primaryGuest.getFullName());
            villa.setPrimaryTenantId(primaryGuest.getId());
            villa.setPrimaryTenantName(primaryGuest.getFullName());
        }
        villaRepository.save(villa);
    }
}
