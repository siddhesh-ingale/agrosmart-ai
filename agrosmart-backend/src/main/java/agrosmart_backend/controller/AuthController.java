package agrosmart_backend.controller;

import agrosmart_backend.dto.TokenResponse;
import agrosmart_backend.dto.UserCreateRequest;
import agrosmart_backend.dto.UserLoginRequest;
import agrosmart_backend.dto.UserResponse;
import agrosmart_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register( @Valid @RequestBody UserCreateRequest request ) {
        UserResponse response = authService.registerUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login( @Valid @RequestBody UserLoginRequest request ){
        TokenResponse response = authService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}