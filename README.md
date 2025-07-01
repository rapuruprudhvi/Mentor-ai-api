# 🧠 Mentor AI – Backend

## 🚀 Backend Setup Instructions

Follow these steps to set up and run the backend server locally:

---

### Requirements

1. NVM 0.38.0
2. Node 24.2.0
3. NPM 11.4.2

### 📁 1. Clone the Repository

```
git clone git@github.com:rapuruprudhvi/Mentor-ai-api.git
cd Mentor-ai-api
npm install
```

### 📁 **2. Database Setup**

- Create a `.env` file in the root of the project directory.
- Add the following environment variables** to the `.env` file:

```
DB_HOST=localhost
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=mentor_ai_development
JWT_SECRET=your_jwt_secret_key
```

**Note:** Create `mentor_ai_development` database in your local MySQL instance

```
mysql -u <YOUR_USERNAME> -p

create database mentor_ai_development;
```

#### Steps to Generate JWT Secret
To generate the JWT secret, run the following command in your terminal:

```
openssl rand -hex 32
```

### 📁 3. **Migrations**
Run the following commands to set up your database schema:

```bash

# Run migrations
npm run migration:run

(NOTE: Frontend team should avoid this command)
# Revert migrations
npm run migration:revert

(NOTE: Frontend team should avoid this command)
# Generate migration
npm run migration:generate
```

### 4. Stripe Configuration for Local Testing
To test subscription and payment-related features locally using Stripe, follow the steps below:

🔧 1. Create a Stripe Account
Sign up at https://dashboard.stripe.com and switch to Test Mode.

🔑 2. Go to API Keys page, https://dashboard.stripe.com/test/apikeys

Add Stripe Environment Variables
In your `.env` file, add:

.env
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
```
Replace the above values with your actual test keys from the Stripe dashboard.

⚙️ 3. Install Stripe CLI
Download and install the Stripe CLI from: https://stripe.com/docs/stripe-cli

🔄 4. Forward Webhooks to Localhost
Run this command in your terminal:

```
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```
Copy the `whsec_...` key and paste it in your `.env` file under `STRIPE_WEBHOOK_SECRET`.

🧪 5. Use Test Card Numbers
Card Number	Description
```
4242 4242 4242 4242	Successful payment
4000 0000 0000 9995	Requires authentication
4000 0000 0000 0341	Declined card
```
More test cards: Stripe Docs → Test Cards

### 📁 5. Start Server

```bash
npm run dev
```

You can access API at `http://localhost:4000`

### 📁 6. API Documentation

Open `http://localhost:4000/api/docs`



### Email Configuration
To configure email functionality, you need to set up the following environment variables in your `.env` file:

```env
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_gmail_app_password
DEVELOPER_RECEIVER="Enter the developers email"
FRONTEND_URL="enter the your frontend url"
```
steps to generate Gmail App Password:
1. Go to your Google Account.(https://myaccount.google.com/)
2. Select Security.
3. Under "Signing in to Google," turn on 2-Step Verification if it's not already enabled
4. After 2FA is on, go to App passwords: https://myaccount.google.com/apppasswords
5. Select "Mail" as the app and "Other" as the device, then enter a name (e.g., "My App").
6. Click "Generate" and copy the generated app password.


### OpenAI Installation
To install ollama and set up the OpenAI API, follow these steps:
```bash
# Install ollama :
curl -sSfL https://ollama.com/download.sh | sh
# Pull the tinyllama model
ollama pull tinyllama


