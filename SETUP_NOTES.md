# Text-to-SQL Powerhouse - Local Setup

## What Was Done

This repository has been successfully set up to run locally **without requiring Google Vertex AI or Pinecone services**.

### Changes Made

1. **Database Setup**
   - Created PostgreSQL database: `text_to_sql_db`
   - Loaded demo schema with 4 tables: `users`, `products`, `orders`, `order_items`
   - Populated with sample data for testing

2. **Code Modifications**
   - Created `src/services/sqlGeneratorSimple.js` - A pattern-based SQL generator that doesn't require AI services
   - Updated `src/routes/api.js` to use the simple generator instead of the AI-based one
   - Fixed database configuration in `src/config/db.js` to use `DB_NAME` instead of `DB_DATABASE`

3. **Environment Configuration**
   - Set up `.env` file with local PostgreSQL credentials
   - Database: `text_to_sql_db`
   - User: `postgres`
   - No password required (local setup)

## How to Run

1. **Start the development server:**
   ```bash
   cd /Users/debojyoti.mandal/personal/text-to-sql-powerhouse
   pnpm run dev
   ```

2. **Test the API:**
   ```bash
   # Run the test script
   ./test-queries.sh

   # Or test individual queries
   curl -X POST http://localhost:3001/api/generate-sql \
     -H "Content-Type: application/json" \
     -d '{"question":"Show me all users"}'
   ```

## Available Query Patterns

The simple SQL generator supports these natural language patterns:

### List Queries
- "Show all users" / "All users"
- "Show all products" / "All products"
- "Show all orders" / "All orders"
- "Show active users"
- "Show completed orders"
- "Show electronics products"

### Count Queries
- "Count users" / "Count all users"
- "Count products"
- "Count orders"
- "Count active users"
- "Count completed orders"

### Aggregate Queries
- "Total revenue" / "Total sales"
- "Product category" (breakdown by category)

### Complex Queries
- "Top products" / "Popular products"
- "Orders by user" / "User orders"
- "Recent orders" / "Recent orders in last 30 days"

## Database Schema

### users
- id, name, email, created_at, status

### products
- id, name, description, price, category, stock_quantity, created_at

### orders
- id, user_id, total_amount, status, created_at, updated_at

### order_items
- id, order_id, product_id, quantity, price, created_at

## Sample Data

- 5 users
- 8 products (Electronics, Furniture, Stationery)
- 5 orders
- 8 order items

## Server Status

- **Running at:** http://localhost:3001
- **API Endpoint:** POST /api/generate-sql
- **Logs:** Check the `logs/` directory for detailed logging

## Next Steps (Optional)

To use the full AI-powered features:

1. **Get Google Cloud Credentials:**
   - Create a Google Cloud project
   - Enable Vertex AI API
   - Download service account JSON
   - Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

2. **Set up Pinecone:**
   - Sign up at https://www.pinecone.io/
   - Create an index
   - Add API key to `.env`

3. **Revert to AI-based generator:**
   - Change `src/routes/api.js` to import from `../services/sqlGenerator.js`

## Troubleshooting

If you encounter errors:

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready
   ```

2. **Verify database exists:**
   ```bash
   psql -d text_to_sql_db -c "\dt"
   ```

3. **Check server logs:**
   ```bash
   tail -f logs/combined-*.log
   ```

4. **Restart the server:**
   - Press Ctrl+C to stop
   - Run `pnpm run dev` again
