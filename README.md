# Interest-based-networking-platform

## Overview

The Interest-Based Networking Platform is a full-stack web application designed to help users discover and connect with people who share similar interests, communities, and collaboration goals.

Unlike traditional social media platforms that focus on content feeds and follower counts, this platform emphasizes:

- Purpose-driven networking
- Community-based interaction
- Interest-oriented recommendations
- Structured collaboration activities

The system allows users to:
- Register and manage profiles
- Select interests
- Create and join communities
- Participate in activities/discussions
- Discover users with similar interests

---

# Tech Stack

## Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- MySQL

## Frontend
- React.js
- Axios
- HTML/CSS

## Database
- MySQL

---

# Features

## User Management
- User registration
- User login
- View user profile
- Update user details
- Delete user

## Interest Management
- Add interests
- View interests
- Associate interests with users and communities

## Community Management
- Create communities
- Join communities
- Leave communities
- View joined communities
- Discover communities

## Activity Management

Activities represent:
- Discussions
- Collaboration requests
- Mentorship requests
- Networking opportunities

Features include:
- Create activity
- View community activities
- Delete activity

## Recommendation System

The platform recommends users based on:
- Shared interests
- Common networking context

Users with similar interests are suggested as potential connections.

---

# Project Structure

src/main/java/com/prime/interest

├── Controller  
│   ├── UserController  
│   ├── CommunityController  
│   ├── InterestController  
│   └── ActivityController  

├── Entity  
│   ├── User  
│   ├── Interest  
│   ├── Community  
│   ├── CommunityMember  
│   └── Activity  

├── Repository  
│   ├── UserRepository  
│   ├── InterestRepository  
│   ├── CommunityRepository  
│   ├── CommunityMemberRepository  
│   └── ActivityRepository  

├── Service  
│   ├── UserService  
│   ├── CommunityService  
│   ├── InterestService  
│   └── ActivityService  

---

# Database Design

## Main Entities

### User
Stores:
- username
- email
- password
- interests
- joined communities

### Interest
Represents categories such as:
- AI
- React
- Spring Boot
- Cybersecurity

### Community
Represents networking groups based on interests.

Examples:
- AI Enthusiasts
- React Developers

### CommunityMember
Tracks which users joined which communities.

### Activity
Represents structured interactions such as:
- discussions
- collaboration requests
- mentorship opportunities

---

# API Endpoints

## User APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/users/register | Register user |
| POST | /api/users/login | Login user |
| GET | /api/users/{id} | Get user by ID |
| PUT | /api/users/update | Update user |
| DELETE | /api/users/delete/{id} | Delete user |
| GET | /api/users/recommend/{userId} | Recommend users |

---

## Interest APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/interests/add | Add interest |
| GET | /api/interests/{id} | Get interest |
| PUT | /api/interests/update/{id} | Update interest |
| DELETE | /api/interests/delete/{id} | Delete interest |

---

## Community APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/communities/add | Create community |
| POST | /api/communities/join | Join community |
| DELETE | /api/communities/leave | Leave community |
| GET | /api/communities/user/{userId} | Joined communities |

---

## Activity APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/activities/create | Create activity |
| GET | /api/activities/community/{communityId} | View activities |
| DELETE | /api/activities/delete/{id} | Delete activity |

---

# Recommendation Logic

The recommendation system uses shared interests to connect users.

Users with matching interests are recommended to each other.

---

# Future Enhancements

Possible future improvements:
- JWT authentication
- Real-time chat
- Advanced recommendation engine
- Activity comments
- Notifications
- Search and filtering
- AI-based matchmaking

---

# Conclusion

The Interest-Based Networking Platform demonstrates how meaningful digital networking can be achieved through structured communities, interest-based recommendations, and collaboration-oriented activities rather than traditional social media feeds.

The project showcases:
- Full-stack development
- REST API design
- Database relationships
- Recommendation logic
- Community interaction workflows

using Spring Boot and React architecture.
