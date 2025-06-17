# 🧠 Mentor AI – Backend

## 🚀 Backend Setup Instructions

Follow these steps to set up and run the backend server locally:

---

### 📁 1. Clone the Repository

````bash
git clone git@github.com:rapuruprudhvi/Mentor-ai-api.git
cd Mentor-ai-api
npm install

### 📁 **2. Database Setup**

- **Create a `.env` file** in the root of the project directory.
- **Add the following environment variables** to the `.env` file:

DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=Mentor_AI_db
JWT_SECRET=your_jwt_secret_key

**Note:**
Create the **Mentor_AI_db** database in your local MySQL instance
To generate the JWT secret, run the following command in your terminal:

```bash
openssl rand -hex 32


### 📁 3. **Migrations**
Run the following commands to set up your database schema:

```bash

# Generate migrations
npm run migration:generate

# Run migrations
npm run migration:run

# Revert migrations (Note: Frontend team should avoid this command)
npm run migration:revert

### 📁 4. **server start**

```bash
npm run dev



  ### Stripe Configuration for Local Testing
To test subscription and payment-related features locally using Stripe, follow the steps below:

🔧 1. Create a Stripe Account
Sign up at https://dashboard.stripe.com and switch to Test Mode.

🔑 2. Add Stripe Environment Variables
In your .env file, add:

.env

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
Replace the above values with your actual test keys from the Stripe dashboard.

⚙️ 3. Install Stripe CLI
Download and install the Stripe CLI from: https://stripe.com/docs/stripe-cli

🔄 4. Forward Webhooks to Localhost
Run this command in your terminal:

bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
Copy the whsec_... key and paste it in your .env file under STRIPE_WEBHOOK_SECRET.

🧪 5. Use Test Card Numbers
Card Number	Description
4242 4242 4242 4242	Successful payment
4000 0000 0000 9995	Requires authentication
4000 0000 0000 0341	Declined card

More test cards: Stripe Docs → Test Cards


````
