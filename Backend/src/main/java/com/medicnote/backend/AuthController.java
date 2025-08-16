package com.medicnote.backend;

import com.medicnote.backend.dto.LoginRequest;
import com.medicnote.backend.dto.LoginResponse;
import com.medicnote.backend.dto.RegisterRequest;
import com.medicnote.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"}) // Allow frontend to access
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * Login endpoint
     * @param loginRequest login credentials
     * @return ResponseEntity with login response
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Register endpoint
     * @param registerRequest registration data
     * @return ResponseEntity with registration result
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // Convert RegisterRequest to User
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setPhoneNumber(registerRequest.getPhone());
        user.setSpecialization(registerRequest.getSpecialization());
        
        boolean success = authService.register(user);
        LoginResponse response = new LoginResponse();
        if (success) {
            response.setSuccess(true);
            response.setMessage("Registration successful");
            return ResponseEntity.ok().body(response);
        } else {
            response.setSuccess(false);
            response.setMessage("Registration failed. User may already exist.");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Validate token endpoint
     * @param token JWT token to validate
     * @return ResponseEntity with validation result
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        
        if (isValid) {
            return ResponseEntity.ok().body(new LoginResponse("Token is valid"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Token is invalid"));
        }
    }
    
    /**
     * Health check endpoint
     * @return ResponseEntity with health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }
}
