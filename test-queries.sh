#!/bin/bash

# Test script for text-to-sql-powerhouse API
# Usage: ./test-queries.sh

API_URL="http://localhost:3001/api/generate-sql"

echo "=== Text-to-SQL Powerhouse - Test Queries ==="
echo ""

# Function to test a query
test_query() {
    echo "Question: $1"
    echo "Response:"
    curl -s "$API_URL" -X POST -H "Content-Type: application/json" -d "{\"question\":\"$1\"}" | python3 -m json.tool
    echo ""
    echo "---"
    echo ""
}

# Run test queries
test_query "Show me all users"
test_query "Count all products"
test_query "Show all active users"
test_query "Count completed orders"
test_query "Total revenue"
test_query "Top products"
test_query "Orders by user"
test_query "Recent orders in last 7 days"
test_query "Show all electronics products"
test_query "Show all completed orders"

echo "=== Testing Complete ==="
echo ""
echo "Available query patterns:"
echo "  - Show all users/products/orders"
echo "  - Count users/products/orders"
echo "  - Total revenue/sales"
echo "  - Top products / Popular products"
echo "  - Orders by user / User orders"
echo "  - Recent orders"
echo "  - Product category (breakdown by category)"
echo "  - Filter by: active, completed, pending, electronics, furniture"
