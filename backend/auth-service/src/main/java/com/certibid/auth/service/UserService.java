package com.certibid.auth.service;

import com.certibid.auth.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(String id);
}
