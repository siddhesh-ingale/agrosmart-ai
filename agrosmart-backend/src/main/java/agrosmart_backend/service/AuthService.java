package agrosmart_backend.service;

import agrosmart_backend.dto.TokenResponse;
import agrosmart_backend.dto.UserCreateRequest;
import agrosmart_backend.dto.UserLoginRequest;
import agrosmart_backend.dto.UserResponse;
import agrosmart_backend.entity.User;

public interface AuthService {

    UserResponse registerUser(UserCreateRequest request);

    TokenResponse loginUser(UserLoginRequest request);

    User getUserByEmail(String name);
}