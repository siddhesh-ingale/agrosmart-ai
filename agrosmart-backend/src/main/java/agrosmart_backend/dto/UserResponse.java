package agrosmart_backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Integer id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}