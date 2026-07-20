package com.hallmark.reception.config;

import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.entity.UserRole;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.UserRepository;
import com.hallmark.reception.repository.VillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Set<Integer> THREE_BEDROOM_VILLAS = Set.of(
            1, 2, 3, 7, 9, 10, 17, 18, 19, 20, 21, 22, 23, 24);

    private final VillaRepository villaRepository;
    private final GuestRepository guestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        for (int i = 1; i <= 30; i++) {
            final int villaNumber = i;
            Villa villa = villaRepository.findByNumber(String.valueOf(villaNumber))
                    .orElseGet(() -> Villa.builder()
                            .number(String.valueOf(villaNumber))
                            .status(villaNumber == 14 ? "HOUSEKEEPING" : "VACANT")
                            .active(villaNumber != 14)
                            .rentable(villaNumber != 14)
                            .occupancy(0)
                            .rentStatus("NOT_DUE")
                            .cleaningPaymentStatus(villaNumber == 14 ? "NOT_APPLICABLE" : "DUE")
                            .build());

            if (villaNumber == 14) {
                villa.setStatus("HOUSEKEEPING");
                villa.setActive(false);
                villa.setRentable(false);
                villa.setType("Housekeeping / Laundry");
                villa.setOccupancy(0);
                villa.setRentStatus("NOT_DUE");
                villa.setCleaningPaymentStatus("NOT_APPLICABLE");
            } else {
                villa.setActive(true);
                villa.setRentable(true);
                villa.setType(THREE_BEDROOM_VILLAS.contains(villaNumber) ? "3 Bedroom" : "4 Bedroom");
            }
            if (villa.getOccupancy() == null) {
                villa.setOccupancy(0);
            }
            if (villa.getRentStatus() == null) {
                villa.setRentStatus("NOT_DUE");
            }
            if (villa.getCleaningPaymentStatus() == null) {
                villa.setCleaningPaymentStatus("DUE");
            }
            villaRepository.save(villa);
        }

        normalizeGuestRecords();
        seedReceptionists();
    }

    private void normalizeGuestRecords() {
        LocalDate today = LocalDate.now();
        guestRepository.findAll().forEach(guest -> {
            String normalizedStatus = switch (String.valueOf(guest.getStayStatus()).trim().toUpperCase()) {
                case "CHECKED OUT", "CHECKED_OUT" -> "CHECKED_OUT";
                case "BOOKED" -> guest.getCheckInDate() != null && guest.getCheckInDate().isAfter(today) ? "BOOKED" : "OCCUPIED";
                default -> guest.getCheckInDate() != null && guest.getCheckInDate().isAfter(today) ? "BOOKED" : "OCCUPIED";
            };
            guest.setStayStatus(normalizedStatus);
            if (guest.getStayType() == null || guest.getStayType().isBlank()) {
                guest.setStayType(guest.getCheckOutDate() == null ? "OPEN_STAY" : "FIXED_STAY");
            } else if ("OPEN_STAY".equalsIgnoreCase(guest.getStayType())) {
                guest.setStayType("OPEN_STAY");
                guest.setCheckOutDate(null);
            } else {
                guest.setStayType("FIXED_STAY");
            }
            guestRepository.save(guest);
        });
    }

    private void seedReceptionists() {
        createUserIfMissing("admin", "Admin Manager", UserRole.ROLE_MANAGER, "admin123");
        createUserIfMissing("mutesi", "Mutesi", UserRole.ROLE_RECEPTIONIST, "mutesi123");
        createUserIfMissing("henry", "Henry", UserRole.ROLE_RECEPTIONIST, "henry123");
        createUserIfMissing("grace", "Grace", UserRole.ROLE_RECEPTIONIST, "grace123");
        createUserIfMissing("ellie", "Ellie", UserRole.ROLE_RECEPTIONIST, "ellie123");
    }

    private void createUserIfMissing(String username, String fullName, UserRole role, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        User user = User.builder()
                .fullName(fullName)
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);
    }
}
