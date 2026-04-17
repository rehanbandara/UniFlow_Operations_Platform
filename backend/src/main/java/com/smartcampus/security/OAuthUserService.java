package com.smartcampus.security;

import com.smartcampus.service.UserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class OAuthUserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public OAuthUserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Object emailObj = oAuth2User.getAttributes().get("email");
        Object nameObj = oAuth2User.getAttributes().get("name");

        String email = emailObj != null ? emailObj.toString() : null;
        String name = nameObj != null ? nameObj.toString() : "Unknown";

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider.");
        }

        userService.processOAuthPostLogin(name, email);

        return oAuth2User;
    }
}