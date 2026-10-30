package agrosmart_backend.service.impl;

import agrosmart_backend.dto.TokenResponse;
import agrosmart_backend.dto.UserCreateRequest;
import agrosmart_backend.dto.UserLoginRequest;
import agrosmart_backend.dto.UserResponse;
import agrosmart_backend.entity.User;
import agrosmart_backend.repository.UserRepository;
import agrosmart_backend.security.JwtService;
import agrosmart_backend.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ==============================
    // REGISTER USER
    // ==============================

    @Override
    public UserResponse registerUser(UserCreateRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(
                        passwordEncoder.encode(request.getPassword())
                )
                .build();

        // Save user to database
        User savedUser = userRepository.save(user);

        // Return safe response
        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .build();
    }

    // ==============================
    // LOGIN USER
    // ==============================

    @Override
    public TokenResponse loginUser(UserLoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Return token
        return TokenResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}