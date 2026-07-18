package com.hallmark.reception.config;

import com.hallmark.reception.entity.User;
import com.hallmark.reception.entity.UserRole;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.UserRepository;
import com.hallmark.reception.repository.VillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final VillaRepository villaRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (villaRepository.count() == 0) {
            for (int i = 1; i <= 30; i++) {
                Villa villa = Villa.builder()
                        .number(String.valueOf(i))
                        .status("VACANT")
                        .active(true)
                        .rentable(i != 14)
                        .notes(null)
                        .build();

                villaRepository.save(villa);
            }
        }

        seedReceptionists();
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
