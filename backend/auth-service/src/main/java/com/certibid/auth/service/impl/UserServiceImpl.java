package com.certibid.auth.service.impl;

import com.certibid.auth.dto.response.UserResponse;
import com.certibid.auth.entity.User;
import com.certibid.auth.exception.InvalidCredentialsException;
import com.certibid.auth.repository.UserRepository;
import com.certibid.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .roleTitle(user.getRoleTitle())
                .department(user.getDepartment())
                .organization(user.getOrganization())
                .status(user.getStatus())
                .avatar(user.getAvatar())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
