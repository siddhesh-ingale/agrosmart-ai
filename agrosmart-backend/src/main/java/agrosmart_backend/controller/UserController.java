package agrosmart_backend.controller;

import agrosmart_backend.dto.UserResponse;
import agrosmart_backend.entity.User;
import agrosmart_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    AuthService authService;
    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser( Authentication authentication ) {
        Object email =  authentication.getPrincipal();
        User user = authService.getUserByEmail(email.toString());
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        return ResponseEntity.ok(response);
    }
}