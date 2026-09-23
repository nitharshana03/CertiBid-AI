package com.certibid.procurement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.certibid.procurement.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserId(String userId);

    List<Notification> findByUserIdOrderByTimestampDesc(String userId);

    List<Notification> findAllByOrderByTimestampDesc();
}