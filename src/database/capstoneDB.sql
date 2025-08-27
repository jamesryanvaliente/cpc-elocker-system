-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: capstone
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'student',
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (34,'john1','$2b$10$bxSXgH9aL323xtW2kf8d4e49T6J3QZRP7iQ62t/w3Exxw85hRvhR2','student'),(38,'john','$2b$10$hSvax9Ao/tYeVyr8Dabe2eMhvJGxG/5vQUpkqfJVf.TPHRtWDECJC','student'),(40,'valiente','$2b$10$QYYKUIrgQSxEk6RHHf6fGezCZMJ50BnRcqunDX/JUkwsRsu90bX/q','student'),(44,'admin','$2b$10$V9qz9NQP9HH0xZLV/SFZIOFgEIUUpzS.ifsNoJmBgCjy7Tl5AyKuC','admin'),(45,'jane','$2b$10$XkHWwyeEyJBrjoUhPM0.Cumpdf60IJIiHHNRt1wQhaPg5k4j2ZrQC','student'),(46,'Cabiro','$2b$10$aD.7A4UBgJ3fTPcG6hxveentJEZOhXnMxX7Omx3jz5oQG/DcFmue6','admin'),(47,'dionne','$2b$10$oftkGIDLLV88M8bd/IoPK.874D2zwxvmN.2GsE227CtRIGR.Tij4W','student'),(51,'Cabiro1','$2b$10$/fJ5ixAWKnPB56TXLhv8ZeFJr/Q/PdJuzMJ33qsSBBOZID5nYdyli','admin'),(55,'test','$2b$10$xRzM/3jVi6qSM9bUQymJLel1jkhW/YXfkbIuwPDn7lRZIIANqRy2i','student'),(57,'test1','$2b$10$fu3U7kFDWM.8b3aFcPT/XupK2eTXTfgr/Q0ubal.tk2KcQ.RZivsm','student'),(58,'test2','$2b$10$FoKjQObd8H6oBWb8wpsP1uuFJ2/K5OOaZZxtD1fLLjJnwXsPvnr/e','student'),(61,'test3','$2b$10$0bpguejAuZ546/dBakNGfeDUV3z1z4RYym3IBJXZmeeqxzxW6Gnji','student'),(64,'test4','$2b$10$CqcX9dxWmoIbbZNfgOycdei0rPbqA1L7ks8L6wqTtdApasMSmfWWm','student');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cancellation_reasons`
--

DROP TABLE IF EXISTS `cancellation_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cancellation_reasons` (
  `cancel_id` int(11) NOT NULL AUTO_INCREMENT,
  `rental_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `cancelled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`cancel_id`),
  KEY `rental_id` (`rental_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cancellation_reasons_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `locker_rentals` (`rental_id`) ON DELETE CASCADE,
  CONSTRAINT `cancellation_reasons_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancellation_reasons`
--

LOCK TABLES `cancellation_reasons` WRITE;
/*!40000 ALTER TABLE `cancellation_reasons` DISABLE KEYS */;
INSERT INTO `cancellation_reasons` VALUES (1,31,39,'i don’t need it anymore','2025-08-27 18:05:27'),(2,32,39,'i don’t need it anymore','2025-08-27 18:09:38'),(3,33,39,'i don’t need it anymore','2025-08-27 18:10:35');
/*!40000 ALTER TABLE `cancellation_reasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_name` (`course_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (8,'BSHM'),(9,'BSIT');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locker_rentals`
--

DROP TABLE IF EXISTS `locker_rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locker_rentals` (
  `rental_id` int(11) NOT NULL AUTO_INCREMENT,
  `locker_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `months` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `action_type` enum('rent','reserve') NOT NULL DEFAULT 'rent',
  PRIMARY KEY (`rental_id`),
  KEY `locker_id` (`locker_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `locker_rentals_ibfk_1` FOREIGN KEY (`locker_id`) REFERENCES `lockers` (`locker_id`),
  CONSTRAINT `locker_rentals_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locker_rentals`
--

LOCK TABLES `locker_rentals` WRITE;
/*!40000 ALTER TABLE `locker_rentals` DISABLE KEYS */;
INSERT INTO `locker_rentals` VALUES (20,39,20,4,'2025-08-12','2025-12-12',240.00,60.00,180.00,'cash','active','2025-08-12 14:02:14','reserve'),(21,40,20,5,'2025-08-12','2026-01-12',300.00,60.00,240.00,'qr','active','2025-08-12 14:08:26','rent'),(22,41,31,5,'2025-08-14','2026-01-14',300.00,60.00,240.00,'cash','active','2025-08-14 00:28:09','reserve'),(23,42,31,5,'2025-08-14','2026-01-14',300.00,60.00,240.00,'cash','active','2025-08-14 01:07:52','reserve'),(24,43,33,5,'2025-08-14','2026-01-14',300.00,60.00,240.00,'cash','active','2025-08-14 01:37:19','reserve'),(25,48,33,NULL,'2025-08-14',NULL,NULL,NULL,NULL,'cash','pending','2025-08-14 01:44:03','reserve'),(26,49,33,5,'2025-08-14','2026-01-14',300.00,60.00,240.00,'qr','active','2025-08-14 01:45:06','rent'),(27,44,34,NULL,'2025-08-27',NULL,NULL,NULL,NULL,'cash','pending','2025-08-27 01:55:05','reserve'),(28,45,34,5,'2025-08-27','2026-01-27',300.00,60.00,240.00,'qr','active','2025-08-27 01:56:01','rent'),(29,46,36,5,'2025-08-28','2026-01-28',300.00,60.00,240.00,'cash','active','2025-08-28 00:46:37','reserve'),(30,47,36,5,'2025-08-28','2026-01-28',300.00,60.00,240.00,'cash','active','2025-08-28 01:22:29','reserve'),(31,48,39,NULL,'2025-08-28',NULL,NULL,NULL,NULL,'cash','cancelled','2025-08-28 01:45:11','reserve'),(32,48,39,NULL,'2025-08-28',NULL,NULL,NULL,NULL,'cash','cancelled','2025-08-28 02:08:55','reserve'),(33,48,39,NULL,'2025-08-28',NULL,NULL,NULL,NULL,'cash','cancelled','2025-08-28 02:10:07','reserve');
/*!40000 ALTER TABLE `locker_rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lockers`
--

DROP TABLE IF EXISTS `lockers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lockers` (
  `locker_id` int(11) NOT NULL AUTO_INCREMENT,
  `locker_number` varchar(10) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('available','reserved','pending','rented') NOT NULL DEFAULT 'available',
  `assigned_to` int(11) DEFAULT NULL,
  `reserved_date` datetime DEFAULT NULL,
  `reserve_expiry` datetime DEFAULT NULL,
  `rented_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`locker_id`),
  UNIQUE KEY `locker_number` (`locker_number`),
  KEY `lockers_ibfk_1` (`assigned_to`),
  CONSTRAINT `lockers_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lockers`
--

LOCK TABLES `lockers` WRITE;
/*!40000 ALTER TABLE `lockers` DISABLE KEYS */;
INSERT INTO `lockers` VALUES (39,'A1','lobby','rented',20,NULL,'0000-00-00 00:00:00','2025-08-12 14:06:59','2025-12-12 14:06:59','test','2025-08-12 05:53:05','2025-08-12 06:06:59'),(40,'A2','lobby','rented',20,NULL,'0000-00-00 00:00:00','2025-08-12 14:08:26','2026-01-12 14:08:26','test','2025-08-12 05:53:11','2025-08-12 06:08:26'),(41,'A3','lobby','rented',31,NULL,'0000-00-00 00:00:00','2025-08-14 01:39:00','2026-01-14 01:39:00','test','2025-08-12 05:53:17','2025-08-13 17:39:00'),(42,'A4','lobby','rented',31,NULL,'0000-00-00 00:00:00','2025-08-14 01:18:50','2026-01-14 01:18:50','test','2025-08-12 05:53:23','2025-08-13 17:18:50'),(43,'A5','lobby','rented',33,NULL,'0000-00-00 00:00:00','2025-08-14 01:39:42','2026-01-14 01:39:42','test','2025-08-12 05:53:29','2025-08-13 17:39:42'),(44,'A6','lobby','reserved',34,'2025-08-27 01:55:05','2025-08-29 01:55:05',NULL,NULL,'test','2025-08-12 05:53:35','2025-08-26 17:55:05'),(45,'A7','lobby','rented',34,NULL,'0000-00-00 00:00:00','2025-08-27 01:56:01','2026-01-27 01:56:01','test','2025-08-12 05:53:41','2025-08-26 17:56:01'),(46,'A9','lobby','rented',36,NULL,NULL,'2025-08-28 01:29:14','2026-01-28 01:29:14','test','2025-08-12 05:53:53','2025-08-27 17:29:14'),(47,'A10','lobby','rented',36,NULL,NULL,'2025-08-28 01:42:33','2026-01-28 01:42:33','test','2025-08-12 05:54:04','2025-08-27 17:42:33'),(48,'A11','lobby','available',39,'2025-08-28 02:10:07','2025-08-30 02:10:07',NULL,NULL,'test','2025-08-13 17:43:24','2025-08-27 18:10:35'),(49,'A12','lobby','rented',33,NULL,NULL,'2025-08-14 01:45:06','2026-01-14 01:45:06','test','2025-08-13 17:43:31','2025-08-13 17:45:06');
/*!40000 ALTER TABLE `lockers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_history`
--

DROP TABLE IF EXISTS `payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_history` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `rental_id` int(11) NOT NULL,
  `status` enum('ongoing','paid','overdue') NOT NULL DEFAULT 'ongoing',
  `payment_date` date NOT NULL,
  `due_date` date NOT NULL,
  `payment_source` enum('cash','qr') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `rental_id` (`rental_id`),
  CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `locker_rentals` (`rental_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_history`
--

LOCK TABLES `payment_history` WRITE;
/*!40000 ALTER TABLE `payment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `stud_id` int(11) DEFAULT NULL,
  `f_name` varchar(255) DEFAULT NULL,
  `m_name` varchar(255) DEFAULT NULL,
  `l_name` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_pic` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `stud_id` (`stud_id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_ibfk_1` (`account_id`),
  KEY `users_ibfk_2` (`course_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (15,34,8,20220003,'John','D','Do','Male','johndo1@example.com','2025-07-16 14:48:52',NULL),(19,38,8,20220005,'John','D','Do','Male','johndo5@example.com','2025-07-16 15:02:14',NULL),(20,40,9,20220660,'James Ryan','Craste','Valiente','Male','valiente@example.com','2025-08-26 16:22:02','20.jpg'),(22,44,9,20220770,'Ben Howard','Pareja','Casquejo','Male','casquejo@gmail.com','2025-07-18 07:36:48',NULL),(23,45,9,20220099,'Jane','M','Doe','Female','jane.doe@example.com','2025-07-18 07:42:34',NULL),(24,46,9,20220100,'James Ryan','T','Cabiro','Male','cabiro@example.com','2025-07-18 07:44:03',NULL),(25,47,9,202201001,'Dionne Philip','Tiyok','Valiente','Male','dionnevaliente@example.com','2025-07-18 07:45:22',NULL),(28,51,9,20220102,'James Ryan','T','Cabiro','Male','cabiro1@example.com','2025-07-18 07:53:24',NULL),(31,55,9,202201011,'test','test','test','Male','test@example.com','2025-07-21 08:38:45',NULL),(33,57,9,202201015,'test','test','test','Male','test1@example.com','2025-07-30 07:43:01',NULL),(34,58,9,202201016,'test','test','test','Male','test2@example.com','2025-07-30 08:03:57',NULL),(36,61,9,202201020,'test','test','test','Male','test3@example.com','2025-08-27 16:44:27',NULL),(39,64,9,202201021,'test4','test4','test4','Male','test4@example.com','2025-08-27 17:43:47',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-28  3:46:54
