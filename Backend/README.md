# MedicNote Backend

A Spring Boot backend application for the MedicNote medical management system.

## Features

- **User Authentication**: JWT-based authentication for doctors
- **User Registration**: Secure user registration with password encryption
- **Database**: H2 in-memory database for development
- **Security**: Spring Security with CORS configuration
- **API Documentation**: RESTful API endpoints

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

## Getting Started

### 1. Build the Application

```bash
cd medicnote-backend
mvn clean install
```

### 2. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 3. Access H2 Database Console

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:medicnote`
- Username: `sa`
- Password: `password`

## API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "priya.sharma@medicnote.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Priya Sharma",
    "email": "priya.sharma@medicnote.com",
    "specialization": "General Physician",
    "phoneNumber": "+91-98765-43210"
  }
}
```

#### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "Dr. New Doctor",
  "email": "new.doctor@medicnote.com",
  "password": "password123",
  "specialization": "Cardiologist",
  "phoneNumber": "+91-98765-43211",
  "licenseNumber": "MED004"
}
```

#### Validate Token
- **POST** `/api/auth/validate?token=your_jwt_token`

#### Health Check
- **GET** `/api/auth/health`

## Test Users

The application comes with pre-configured test users:

1. **Dr. Priya Sharma**
   - Email: `priya.sharma@medicnote.com`
   - Password: `password123`
   - Specialization: General Physician

2. **Dr. Rajesh Kumar**
   - Email: `rajesh.kumar@medicnote.com`
   - Password: `password123`
   - Specialization: Cardiologist

3. **Dr. Anjali Patel**
   - Email: `anjali.patel@medicnote.com`
   - Password: `password123`
   - Specialization: Pediatrician

## Configuration

### Application Properties

- **Server Port**: 8080
- **Database**: H2 in-memory
- **JWT Secret**: `medicnoteSecretKeyForJWTTokenGenerationAndValidation2024`
- **JWT Expiration**: 24 hours
- **CORS**: Enabled for `http://localhost:5173`

### Environment Variables

You can override these properties using environment variables:

- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRATION`: JWT expiration time in milliseconds
- `SERVER_PORT`: Server port

## Security

- **Password Encryption**: BCrypt password hashing
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configured for frontend access
- **Validation**: Input validation with Bean Validation

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Doctor's name |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Encrypted password |
| phone_number | VARCHAR(20) | Phone number |
| specialization | VARCHAR(100) | Medical specialization |
| license_number | VARCHAR(50) | Medical license number |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Development

### Project Structure

```
src/main/java/com/medicnote/backend/
├── BackendApplication.java          # Main application class
├── User.java                        # User entity
├── UserRepository.java              # Data access layer
├── AuthController.java              # Authentication endpoints
├── config/
│   ├── SecurityConfig.java          # Security configuration
│   └── DataInitializer.java         # Test data initialization
├── dto/
│   ├── LoginRequest.java            # Login request DTO
│   └── LoginResponse.java           # Login response DTO
├── service/
│   └── AuthService.java             # Authentication service
└── util/
    └── JwtUtil.java                 # JWT utility class
```

### Adding New Features

1. Create entity classes in the root package
2. Create repository interfaces extending `JpaRepository`
3. Create service classes with business logic
4. Create DTOs for request/response objects
5. Create controller classes for REST endpoints
6. Add appropriate validation annotations

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `application.properties`
   - Or kill the process using the port

2. **CORS Issues**
   - Ensure the frontend URL is correctly configured
   - Check browser console for CORS errors

3. **Database Connection Issues**
   - H2 console should be accessible at `/h2-console`
   - Check application logs for database errors

### Logs

Enable debug logging by setting:
```properties
logging.level.com.medicnote.backend=DEBUG
```

## Production Deployment

For production deployment:

1. Change database to PostgreSQL or MySQL
2. Use environment variables for sensitive data
3. Configure proper CORS settings
4. Use HTTPS
5. Set up proper logging
6. Configure JWT secret securely

## License

This project is for educational purposes. 