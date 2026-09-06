# DealFlow360 🚀

> **Self-Governing B2B Sales & Deal Management Platform**

DealFlow360 is a full-stack B2B sales platform designed to automate the complete **quote-to-cash workflow** — from quotation creation and discount evaluation to approval routing, customer negotiation, fulfillment, subscriptions, invoicing, deal health monitoring, and upsell opportunities.

The platform reduces manual decision-making by continuously evaluating deals against business rules and automatically routing risky or exceptional deals for approval.

---

## 🎯 Problem Statement

Traditional B2B sales processes often involve:

- Manual quotation preparation
- Complex discount approvals
- Delayed communication between Sales, Finance, and Operations
- Lack of visibility into deal health
- Manual fulfillment coordination
- Separate handling of one-time and recurring products
- Difficult customer negotiation workflows
- Poor auditability of pricing decisions

These disconnected processes can result in:

- Approval delays
- Revenue leakage
- Excessive discounting
- Operational errors
- Poor customer experience

### 💡 Our Solution

**DealFlow360** creates a centralized, rule-driven workflow where the system automatically:

1. Builds and manages quotations
2. Calculates discounts and deal risk
3. Routes deals to the correct approver
4. Handles customer negotiation
5. Re-evaluates negotiated terms
6. Splits fulfillment across warehouses
7. Supports one-time and recurring billing
8. Generates invoices
9. Tracks deal health
10. Maintains a complete audit trail
11. Identifies potential upsell opportunities

---

# ✨ Key Features

## 1. 📋 Smart Quotation Builder

Sales representatives can create quotations containing multiple products with:

- Product selection
- Quantity
- Unit price
- Line-level discounts
- One-time products
- Recurring subscription products
- Billing schedules
- Automatic subtotal calculation
- Automatic total calculation

A single quotation can contain both one-time and recurring products.

---

## 2. 🧠 Intelligent Discount Risk Engine

DealFlow360 evaluates discounts automatically instead of relying entirely on manual approval.

The system considers factors such as:

- Customer tier
- Historical average discount
- Current discount
- Deal value
- Discount deviation
- Product-level pricing
- Overall blended discount

The result is a calculated deal risk that can trigger automatic approval routing.

### Example

```text
Customer Historical Discount: 8%
Current Deal Discount:       18%
Deviation:                   +10%

Risk Level: HIGH
→ Approval Required
```

---

## 3. 🔄 Automatic Approval Routing

Deals are automatically routed based on configured business rules.

```text
                    Quotation
                        │
                        ▼
                 Risk Evaluation
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Low Risk     Medium Risk    High Risk
          │             │             │
          ▼             ▼             ▼
      Continue        Manager       Higher
                     Approval       Approval
```

Approvers can:

- Review quotations
- Inspect discount details
- Approve deals
- Reject deals
- Request changes
- View deal information

---

## 4. 🤝 Customer Portal

Customers have a completely separate portal from internal users.

Customers can:

- Log in securely
- View their quotations
- Inspect quotation lines
- Negotiate terms
- Request discount changes
- Add comments
- View negotiation history
- Add recommended upsells
- Confirm quotations

### Customer Flow

```text
Customer Login
      ↓
My Quotations
      ↓
Select Quotation
      ↓
Review Terms
      ↓
Recommended Upsells
      ↓
Request Changes / Negotiate
      ↓
Confirm Quotation
```

Customer authentication uses a separate portal token from internal employee authentication.

---

## 5. 💬 Customer Negotiation

Customers can negotiate quotation terms without directly modifying internal records.

They can submit:

- Comments
- Line-specific requests
- Counter-discount proposals

### Example

```text
Customer:

"We would like an additional 5% discount
on the Analytics Add-on."

        ↓

DealFlow360

Evaluates new discount
        ↓
Risk Engine
        ↓
Approval Engine
```

If the requested terms exceed configured thresholds, the quotation can automatically return to internal approval.

This creates a controlled negotiation process while keeping the internal approval workflow intact.

---

## 6. 🛍️ Intelligent Upsell Recommendations

DealFlow360 can identify complementary products that may be relevant to the customer.

### Example

```text
Current Quotation

Enterprise CRM
10 Users

        ↓

Recommended Upsells

✓ Analytics Add-on
✓ Premium Support
✓ Additional Users
```

Recommendations can be based on:

- Product relationships
- Customer tier
- Purchase history
- Deal value
- Product compatibility

Customers can select an upsell and add it to the quotation.

After an upsell is added, the system automatically recalculates:

```text
Quotation Total
      ↓
Discount
      ↓
Deal Risk
      ↓
Approval Requirement
```

This turns upselling into an integrated part of the quote-to-cash workflow rather than a separate sales activity.

---

## 7. 📦 Warehouse-Aware Fulfillment

A quotation can contain products fulfilled from different warehouses.

DealFlow360 can split fulfillment based on product availability.

```text
                    Quotation
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        Warehouse A           Warehouse B
        Product 1             Product 3
        Product 2             Product 4
             │                     │
             └──────────┬──────────┘
                        ▼
                   Fulfillment
```

This provides better operational visibility after quotation confirmation.

---

## 8. 🔁 Hybrid Billing & Subscriptions

DealFlow360 supports quotations containing both one-time and recurring products.

### One-Time Products

```text
Laptop
Setup Service
Implementation Fee
```

### Recurring Products

```text
Software Subscription
Premium Support
Cloud Service
```

A single quotation can therefore contain:

```text
Order
├── Laptop                 → One-time
├── Implementation         → One-time
├── CRM Subscription       → Monthly
└── Premium Support        → Annual
```

The platform supports appropriate billing schedules and proration for recurring services.

---

## 9. 💳 Invoicing

Invoices can be generated based on the quotation and billing schedule.

The invoice workflow provides visibility into:

- Invoice amount
- Billing period
- Due date
- Payment status
- Related quotation
- Subscription information

---

## 10. ❤️ Deal Health Dashboard

DealFlow360 provides a centralized view of deal health.

Deal health can be evaluated using factors such as:

- Discount risk
- Approval status
- Customer negotiation
- Fulfillment status
- Billing status
- Deal value

This allows sales teams and managers to quickly identify deals that require attention.

---

## 11. 📈 Reporting Dashboard

Administrators and authorized users can view business-level reporting such as:

- Total deals
- Deal values
- Approval trends
- Discount patterns
- Fulfillment status
- Subscription activity
- Invoice information
- Deal health

---

## 12. 📝 Complete Audit Trail

Important actions are recorded for traceability.

Examples:

```text
Quotation Created
Discount Changed
Approval Requested
Approval Approved
Approval Rejected
Customer Negotiation Requested
Upsell Added
Quotation Confirmed
Fulfillment Created
Invoice Generated
```

This makes pricing and workflow decisions easier to review and provides transparency across the entire deal lifecycle.

---

# 👥 User Roles

DealFlow360 supports role-based access control.

| Role | Main Responsibilities |
|---|---|
| **Sales Representative** | Create quotations, manage customers, monitor deals |
| **Sales Manager / Approver** | Review and approve risky deals |
| **Finance / Operations** | Billing, fulfillment, invoices and operational processing |
| **Customer** | View quotations, negotiate, add upsells and confirm |
| **Admin** | Configuration, products, discounts and reporting |

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Customer       │
                         │      Portal         │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌────────────────┐       ┌─────────────────────┐
│ Sales Team     │──────►│                     │
└────────────────┘       │     DealFlow360     │
                         │       Backend       │
┌────────────────┐       │                     │
│ Approvers      │──────►│      Express.js     │
└────────────────┘       │                     │
                         └──────────┬──────────┘
                                    │
                       ┌────────────┼────────────┐
                       ▼            ▼            ▼
                  ┌─────────┐ ┌──────────┐ ┌────────────┐
                  │ MongoDB │ │   Risk   │ │  Approval  │
                  │         │ │  Engine  │ │   Engine   │
                  └─────────┘ └──────────┘ └────────────┘
                                    │
                                    ▼
                              Audit Trail
```

---

# 🛠️ Technology Stack

## Frontend

- React
- React Router
- Zustand
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Zod
- Socket.IO
- node-cron
- Morgan
- CORS

## Architecture

```text
Frontend
   │
   │ REST API
   ▼
Express Backend
   │
   ├── Authentication
   ├── Quotations
   ├── Approval Engine
   ├── Risk Engine
   ├── Negotiation
   ├── Upsell Engine
   ├── Fulfillment
   ├── Subscriptions
   ├── Invoices
   └── Audit Trail
   │
   ▼
MongoDB
```

---

# 📁 Project Structure

```text
DealFlow360/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── quotations/
│   │   │   ├── approvals/
│   │   │   ├── fulfillment/
│   │   │   ├── subscriptions/
│   │   │   ├── invoices/
│   │   │   ├── dealHealth/
│   │   │   ├── products/
│   │   │   ├── admin/
│   │   │   └── portal/
│   │   └── routes/
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   └── package.json
│
├── README.md
└── package.json
```

---

# 🔐 Authentication

DealFlow360 uses separate authentication flows for internal users and customers.

## Internal Users

```text
/login
```

Internal users authenticate using JWT-based authentication.

## Customer Portal

```text
/portal/login
```

Customers use a separate portal authentication token.

This separation ensures that customers cannot access:

- Internal sales screens
- Approval screens
- Administration
- Finance and operations
- Internal dashboards

---

# 🔗 Important Routes

## Internal Application

```text
/login
/signup
/dashboard

/quotations
/quotations/:id

/approvals
/approvals/:id

/fulfillment
/fulfillment/:id

/subscriptions
/subscriptions/:id

/invoices
/invoices/:id

/deal-health

/reports

/admin/discount-config

/products
/products/:id
```

## Customer Portal

```text
/portal/login
/portal/quotations
/portal/negotiation
```

---

# 🔌 API Overview

## Authentication

```text
POST /api/auth/login
POST /api/auth/signup
```

## Customer Portal

```text
POST /api/portal/login

GET  /api/portal/my-quotations
GET  /api/portal/my-quotations/:id

POST /api/portal/my-quotations/:id/request
POST /api/portal/my-quotations/:id/confirm
```

## Quotations

```text
GET    /api/quotations
POST   /api/quotations
GET    /api/quotations/:id
PUT    /api/quotations/:id
```

## Approvals

```text
GET  /api/approvals
GET  /api/approvals/:id
POST /api/approvals/:id/approve
POST /api/approvals/:id/reject
```

## Fulfillment

```text
GET /api/fulfillment
GET /api/fulfillment/:id
```

## Subscriptions

```text
GET /api/subscriptions
GET /api/subscriptions/:id
```

## Invoices

```text
GET /api/invoices
GET /api/invoices/:id
```

---

# ⚙️ Installation

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd DealFlow360
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

# 🔧 Environment Variables

Create a `.env` file in the backend.

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dealflow360
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Important:** Never commit real secrets or credentials to GitHub.

---

# ▶️ Running the Project

## Start Backend

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

## Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🌱 Demo Data

For hackathon demonstration, the project can be populated with seed data including:

- Internal users
- Customers
- Products
- Warehouses
- Quotations
- Subscriptions
- Invoices
- Approval scenarios

### Customer Portal Demo

Example:

```text
Portal URL:
http://localhost:5173/portal/login

Email:
customer@example.com

Password:
CustomerPass123
```

> Change demo credentials before deploying the application publicly.

---

# 🧪 Demo Workflow

The recommended hackathon demonstration follows this flow:

```text
1. Sales Rep Login
        ↓
2. Create Quotation
        ↓
3. Add Multiple Products
        ↓
4. Apply Discount
        ↓
5. DealFlow360 Calculates Risk
        ↓
6. Automatic Approval Routing
        ↓
7. Manager Reviews Deal
        ↓
8. Customer Receives Quotation
        ↓
9. Customer Logs into Portal
        ↓
10. Customer Reviews Quotation
        ↓
11. Customer Sees Upsell Recommendations
        ↓
12. Customer Adds Upsell
        ↓
13. Customer Negotiates
        ↓
14. Risk Engine Re-evaluates
        ↓
15. Approval Required if Threshold Exceeded
        ↓
16. Customer Confirms
        ↓
17. Fulfillment Created
        ↓
18. Subscription / Billing
        ↓
19. Invoice Generated
        ↓
20. Deal Health & Audit Trail
```

---

# 🧠 What Makes DealFlow360 Different?

Traditional systems generally require employees to manually coordinate each stage.

DealFlow360 introduces a **self-governing workflow**.

Instead of:

```text
Sales
 ↓
Manual Decision
 ↓
Manager
 ↓
Manual Decision
 ↓
Finance
 ↓
Manual Processing
```

DealFlow360 moves toward:

```text
                    ┌──────────────┐
                    │   Quotation  │
                    └───────┬──────┘
                            ↓
                    ┌──────────────┐
                    │ Risk Engine  │
                    └───────┬──────┘
                            ↓
                    ┌──────────────┐
                    │ Rules Engine │
                    └───────┬──────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
        Within Policy              Outside Policy
              ↓                           ↓
       Auto Continue                 Approval
              │                           │
              └─────────────┬─────────────┘
                            ↓
                        Customer
                            ↓
                    Negotiation / Upsell
                            ↓
                     Re-evaluation
                            ↓
                       Confirmation
                            ↓
                       Fulfillment
                            ↓
                         Billing
```

The platform continuously evaluates the deal and determines the appropriate next action.

---

# 🎯 Core Value Proposition

> **DealFlow360 transforms B2B sales from a manually coordinated process into an intelligent, rule-driven, self-governing deal lifecycle.**

```text
CREATE
  ↓
ANALYZE
  ↓
APPROVE
  ↓
NEGOTIATE
  ↓
UPSELL
  ↓
CONFIRM
  ↓
FULFILL
  ↓
BILL
  ↓
MONITOR
```

---

# 🚀 Future Enhancements

Potential future improvements include:

- ML-based upsell recommendations
- Predictive deal closure probability
- AI-powered negotiation suggestions
- Dynamic pricing
- Advanced revenue forecasting
- Email notifications
- WhatsApp customer notifications
- Payment gateway integration
- Advanced analytics
- Multi-tenant architecture
- Cloud deployment
- Fine-grained permission management

---

# 🏆 Hackathon Highlights

## Business Impact

- Reduces approval delays
- Prevents excessive discounting
- Improves sales visibility
- Simplifies customer negotiation
- Identifies additional revenue opportunities
- Reduces operational errors
- Improves auditability

## Technical Highlights

- MERN stack
- Role-based access control
- Separate customer authentication
- Rule-driven automation
- Discount risk scoring
- Automatic approval routing
- Hybrid billing
- Warehouse-aware fulfillment
- Customer negotiation
- Upsell recommendations
- Real-time-ready architecture
- Complete audit trail

---

# 👨‍💻 Team

**DealFlow360**

Built as a hackathon project demonstrating an intelligent, automated B2B quote-to-cash platform.

---

# 📄 License

This project is developed for educational and hackathon purposes.
