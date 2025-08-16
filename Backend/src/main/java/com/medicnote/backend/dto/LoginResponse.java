package com.medicnote.backend.dto;

public class LoginResponse {
    
    private String token;
    private String message;
    private UserInfo user;
    private boolean success;
    
    // Default constructor
    public LoginResponse() {}
    
    // Constructor for successful login
    public LoginResponse(String token, UserInfo user) {
        this.token = token;
        this.user = user;
        this.success = true;
        this.message = "Login successful";
    }
    
    // Constructor for failed login
    public LoginResponse(String message) {
        this.message = message;
        this.success = false;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    // Inner class for user information
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String specialization;
        private String phoneNumber;
        
        // Default constructor
        public UserInfo() {}
        
        // Constructor with fields
        public UserInfo(Long id, String name, String email, String specialization, String phoneNumber) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.specialization = specialization;
            this.phoneNumber = phoneNumber;
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getSpecialization() {
            return specialization;
        }
        
        public void setSpecialization(String specialization) {
            this.specialization = specialization;
        }
        
        public String getPhoneNumber() {
            return phoneNumber;
        }
        
        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }
} 