package com.smartcampus.config;

import com.smartcampus.security.JwtAuthenticationFilter;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.UserService;
import com.smartcampus.security.OAuthUserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.annotation.web.builders.HttpSecurity.*;


import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static org.springframework.security.config.annotation.web.builders.HttpSecurity.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtTokenProvider jwtTokenProvider;
    private final OAuthUserService oAuthUserService;
    private final UserService userService;

    @Value("${app.frontend.oauth2-redirect-url:http://localhost:3000/oauth2/callback}")
    private String oauth2RedirectUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtTokenProvider jwtTokenProvider,
                          OAuthUserService oAuthUserService,
                          UserService userService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtTokenProvider = jwtTokenProvider;
        this.oAuthUserService = oAuthUserService;
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/error").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuthUserService))
                        .successHandler(this::onOAuth2Success)
                        .failureHandler(this::onOAuth2Failure)
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void onOAuth2Success(HttpServletRequest request,
                                 HttpServletResponse response,
                                 Authentication authentication) throws IOException, ServletException {

        // By default, authentication.getName() is often the "sub" or another identifier.
        // We want email. Our OAuthUserService ensures the user exists in DB, but we still need the email claim.
        // The OAuth2User is stored in authentication.getPrincipal().
        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oAuth2User) {
            Object emailAttr = oAuth2User.getAttributes().get("email");
            email = emailAttr != null ? emailAttr.toString() : null;
        } else {
            email = null;
        }

        if (email == null || email.isBlank()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 login succeeded but email was not found.");
            return;
        }

        // Ensure user exists (safety - OAuthUserService should already do this)
        userService.processOAuthPostLogin(
                (String) ((org.springframework.security.oauth2.core.user.OAuth2User) principal).getAttributes().getOrDefault("name", "Unknown"),
                email
        );

        String token = jwtTokenProvider.generateToken(email);
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        String redirect = oauth2RedirectUrl + "?token=" + encodedToken;
        response.sendRedirect(redirect);
    }

    private void onOAuth2Failure(HttpServletRequest request,
                                 HttpServletResponse response,
                                 org.springframework.security.core.AuthenticationException exception) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 login failed: " + exception.getMessage());
    }
}