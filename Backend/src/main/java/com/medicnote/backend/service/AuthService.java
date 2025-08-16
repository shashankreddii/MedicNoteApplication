package com.medicnote.backend.service;

import com.medicnote.backend.User;
import com.medicnote.backend.UserRepository;
import com.medicnote.backend.dto.LoginRequest;
import com.medicnote.backend.dto.LoginResponse;
import com.medicnote.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Authenticate user login
     * @param loginRequest login request containing email and password
     * @return LoginResponse with token and user info if successful
     */
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmailAndIsActiveTrue(loginRequest.getEmail());
            
            if (userOptional.isEmpty()) {
                return new LoginResponse("Invalid email or password");
            }
            
            User user = userOptional.get();
            
            // Check if password matches
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new LoginResponse("Invalid email or password");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getId());
            
            // Create user info
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getSpecialization(),
                user.getPhoneNumber()
            );
            
            return new LoginResponse(token, userInfo);
            
        } catch (Exception e) {
            return new LoginResponse("Login failed: " + e.getMessage());
        }
    }
    
    /**
     * Register new user
     * @param user user to register
     * @return true if registration successful, false otherwise
     */
    public boolean register(User user) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return false;
            }
            
            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Save user
            userRepository.save(user);
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Validate JWT token
     * @param token JWT token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
    
    /**
     * Get user from JWT token
     * @param token JWT token
     * @return Optional containing user if found
     */
    public Optional<User> getUserFromToken(String token) {
        try {
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
} 