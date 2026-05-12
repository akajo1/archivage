#!/bin/bash

# 🚀 GED Mail Routing - Automated Setup Script

echo "📦 Installing dependencies..."
cd /Users/akajodev/Documents/projects/archivage/backend
npm install

echo "🔄 Generating Prisma migration..."
npx prisma migrate dev --name add_mail_routing_system

echo "✅ Prisma migration complete! Client regenerated."

echo "🏗️  Building backend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Check errors above."
  exit 1
fi

echo "🌱 Seeding database..."
npm run seed

if [ $? -ne 0 ]; then
  echo "⚠️  Seed failed (optional). You can run later with: npm run seed"
fi

echo ""
echo "✨ Setup complete! To start development:"
echo "   cd /Users/akajodev/Documents/projects/archivage/backend"
echo "   npm run start:dev"
echo ""
echo "✅ Backend will be available at http://localhost:3000"
echo ""
echo "📚 API Endpoints:"
echo "   POST   /mail-routings/initialize"
echo "   POST   /mail-routings/:id/forward"
echo "   POST   /mail-routings/:id/verify"
echo "   POST   /mail-routings/:id/reject"
echo "   GET    /mail-routings/:id"
echo "   GET    /mail-routings/inbox/me"
echo ""

