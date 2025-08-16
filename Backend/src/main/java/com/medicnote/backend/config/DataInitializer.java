package com.medicnote.backend.config;

import com.medicnote.backend.User;
import com.medicnote.backend.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no users exist
        if (userRepository.count() == 0) {
            initializeUsers();
        }
    }
    
    private void initializeUsers() {
        // Create test doctor users
        User doctor1 = new User();
        doctor1.setName("Dr. Shashank");
        doctor1.setEmail("shashank@medicnote.com");
        doctor1.setPassword(passwordEncoder.encode("password123"));
        doctor1.setSpecialization("General Physician");
        doctor1.setPhoneNumber("+91-98765-43210");
        doctor1.setLicenseNumber("MED001");
        userRepository.save(doctor1);
        
        User doctor2 = new User();
        doctor2.setName("Dr. Rajesh Kumar");
        doctor2.setEmail("rajesh.kumar@medicnote.com");
        doctor2.setPassword(passwordEncoder.encode("password123"));
        doctor2.setSpecialization("Cardiologist");
        doctor2.setPhoneNumber("+91-87654-32109");
        doctor2.setLicenseNumber("MED002");
        userRepository.save(doctor2);
        
        User doctor3 = new User();
        doctor3.setName("Dr. Anjali Patel");
        doctor3.setEmail("anjali.patel@medicnote.com");
        doctor3.setPassword(passwordEncoder.encode("password123"));
        doctor3.setSpecialization("Pediatrician");
        doctor3.setPhoneNumber("+91-76543-21098");
        doctor3.setLicenseNumber("MED003");
        userRepository.save(doctor3);
        
        System.out.println("Test users initialized successfully!");
        System.out.println("Test credentials:");
        System.out.println("Email: shashank@medicnote.com, Password: password123");
        System.out.println("Email: rajesh.kumar@medicnote.com, Password: password123");
        System.out.println("Email: anjali.patel@medicnote.com, Password: password123");
    }
} 