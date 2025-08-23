#!/bin/bash

echo "🧹 Очистка iOS проекта..."

# Очистка iOS build
cd ios
rm -rf build/
rm -rf Pods/
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "📦 Установка Pods..."
pod install

echo "🔨 Пересборка проекта..."
cd ..

# Очистка React Native cache
npx react-native clean

echo "✅ Очистка завершена! Теперь можно пересобрать проект:"
echo "   npx react-native run-ios --configuration Release"
echo "   или"
echo "   npx react-native run-ios --configuration Debug"
