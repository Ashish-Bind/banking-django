# 🏦 Django Banking and Loan Management System

A full‑stack **Banking and Loan Management** application built using **React (Frontend)** and **Django + Django REST Framework (Backend)**. The project focuses on implementing core banking workflows such as customer management, transactions, and loan processing with secure authentication.

## 📌 Project Structure

```
root/
│── client/   # React application
│── server/    # Django REST API
```

## ✨ Key Features

### Customer & Account Management
- Customer profile with KYC details
- Savings / Current bank accounts
- Auto-generated account numbers
- Account status (Active / Inactive)

### Transactions
- Deposit
- Withdraw
- Transfer between accounts
- Transaction history

### Loan Management
- Loan application
- Credit score calculation (basic)
- Loan approval workflow
- EMI calculation & schedule
- Loan status tracking

### Authentication & Security
- JWT-based authentication
- Role-based access control (Admin / Employee / Customer)


## 🛠 Tech Stack

- **Frontend**: React
- **Backend**: Django, Django REST Framework
- **Auth**: JWT (SimpleJWT)
- **Database**: PostgreSQL / SQLite


## ⚙️ Setup Instructions

### Backend (Django)

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```


### Frontend (React)

```bash
cd client
npm install
npm start
```


Made by Ashish.

