package agrosmart_backend.controller;

import agrosmart_backend.dto.ChatHistoryResponse;
import agrosmart_backend.dto.ChatRequest;
import agrosmart_backend.dto.ChatResponse;
import agrosmart_backend.entity.ChatMessage;
import agrosmart_backend.entity.User;
import agrosmart_backend.service.AiChatService;
import agrosmart_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiChatService aiChatService;
    private final AuthService authService;

    public AiChatController(
            AiChatService aiChatService,
            AuthService authService) {

        this.aiChatService = aiChatService;
        this.authService = authService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        User user = authService.getUserByEmail(
                authentication.getName()
        );

        return ResponseEntity.ok(
                aiChatService.chat(request.getMessage(), user)
        );
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatHistoryResponse>> getChatHistory(
            Authentication authentication) {

        User user = authService.getUserByEmail(
                authentication.getName()
        );

        return ResponseEntity.ok(
                aiChatService.getChatHistory(user)
        );
    }
}