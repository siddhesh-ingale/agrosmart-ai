package agrosmart_backend.repository;

import agrosmart_backend.entity.ChatMessage;
import agrosmart_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findTop10ByUserOrderByCreatedAtDesc(User user);
    List<ChatMessage> findByUserOrderByCreatedAtDesc(User user);
}