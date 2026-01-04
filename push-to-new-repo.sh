#!/bin/bash

# Script to push to a fresh GitHub repository
# Run this AFTER creating the new empty repo on GitHub

cd /Users/debojyoti.mandal/personal/text-to-sql-powerhouse

# Remove old remote
git remote remove origin

# Add new remote (update this URL if needed)
git remote add origin https://github.com/jyoti369/text-to-sql-powerhouse.git

# Push to new repo
git push -u origin main

echo ""
echo "✅ Done! Check your repo at:"
echo "https://github.com/jyoti369/text-to-sql-powerhouse"
