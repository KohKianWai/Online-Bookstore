package com.example.demo.service;

import com.example.demo.dao.ModeratorDao;
import com.example.demo.dao.UserDao;
import com.example.demo.dto.LoginResponseDto;
import com.example.demo.enums.AccountStatus;
import com.example.demo.exception.LoginException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService {

    private final UserDao userDao;
    private final ModeratorDao moderatorDao;

    @Transactional
    public LoginResponseDto login(String username, String password, String role){

        if ("MODERATOR".equals(role)){
            var moderator = moderatorDao.getModeratorByName(username);
            if (moderator == null) {
                throw new LoginException("Invalid username or password.");
            }
            if (!moderator.getPassword().equals(password)){
                throw new LoginException("Invalid username or password.");
            }

            moderator.setLastLoginDate(LocalDateTime.now());
            moderatorDao.update(moderator);

            return LoginResponseDto.builder()
                .username(moderator.getUsername())
                .role(role)
                .build();

        } else if ("USER".equals(role)){
            var user = userDao.getUserByUsername(username);

            if (user == null) {
                throw new LoginException("Invalid username or password.");
            }

            if (AccountStatus.PENDING.equals(user.getStatus())) {
                throw new LoginException("Your account is still pending approval.");
            }

            if (AccountStatus.REJECTED.equals(user.getStatus())) {
                throw new LoginException("Your account has been rejected!");
            }

            if (!user.getPassword().equals(password)) {
                throw new LoginException("Invalid username or password.");
            }


            user.setLastLoginDate(LocalDateTime.now());
            userDao.update(user);

            return LoginResponseDto.builder()
                .username(user.getUsername())
                .role(role)
                .build();

        }
        return null;
    }

    public boolean isUsernameAvailable(String username) {
        return userDao.getUserByUsername(username) == null && moderatorDao.getModeratorByName(username) == null;
    }
}
