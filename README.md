# FED_FinalAssg_Website

# HawkPortal

HawkPortal is a front-end web application designed to support and improve quality of life for multiple stakeholders. The application provides role-based user 
interfaces and features tailored to Customers, NEA Officers, Stall Owners, and 
Operators.

## Stakeholders & Features

### Customers
- Browse stalls and menu items
- Submit ratings and feedback
- Submit complaints related to hygiene or service

### NEA Officers
- Submit stall hygiene grades
- Submit inspection records and remarks
- Schedule inspections and include details
- Store inspections in a database

### Stall Owners
- Maintain their stall information and menu items
- View customer feedback related to their stall
- Track concurrent, completed and cancelled orderes

### Operators
- View overall stall listings
- Monitor feedback, complaints, and hygiene grades
- Monitor rental agreements and stall licenses

## Role-Based Interface

User roles are selected during sign-in for demonstration purposes.
The application dynamically adjusts navigation options and colour themes based on 
the selected role to provide a tailored user experience.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- APIs
    - Firebase
    - Chart.js
- GitHub

## Firebase Usage
### Realtime Database
*Firebase Realtime Database* is used to store and retrieve:
- Customer feedback and ratings
- Customer complaints
- Menu item ratings
- Hygiene inspection records
- Stall details like number of visits and promotions

### Authentication
*Firebase Authentication* is used to manage users on the platform.

## How to Use

1. Open the application homepage.
2. Log in as one of the roles (see this [table](#user-credentials)) OR signup as a Customer (remember to note down the password you chose).
3. Access features relevant to the selected role.
4. Log out to return to guest view.

## User credentials
| Role                          | Email                        | Password     |
|-------------------------------|------------------------------|--------------|
| Customer                      | testuser2@gmail.com          | testuser2    |
| Stall Owner 1 (Wok Hey)       | wokhey@stallowners.com       | wokhey       |
| Stall Owner 2 (Monster Curry) | monstercurry@stallowners.com | monstercurry |
| NEA Officer                   | daniel_tan@nea.sg            | daniel12     |
| Operator                      | food_republic@hawkportal.com | 123456       |
| NEA Officer 2                 | john_tan@nea.sg              | 676767       |