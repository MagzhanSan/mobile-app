#!/bin/bash

echo "🔐 Проверка настроек подписания iOS..."

# Проверяем наличие Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode не найден. Установите Xcode из App Store."
    exit 1
fi

echo "✅ Xcode найден"

# Переходим в папку iOS
cd ios

# Проверяем наличие workspace
if [ ! -d "svekla.xcworkspace" ]; then
    echo "❌ svekla.xcworkspace не найден"
    exit 1
fi

echo "✅ svekla.xcworkspace найден"

# Проверяем настройки проекта
echo ""
echo "📋 Проверка настроек проекта:"
echo ""

# Проверяем Bundle Identifier
BUNDLE_ID=$(xcodebuild -workspace svekla.xcworkspace -scheme svekla -showBuildSettings | grep PRODUCT_BUNDLE_IDENTIFIER | awk '{print $3}')
echo "📦 Bundle Identifier: $BUNDLE_ID"

# Проверяем версию
VERSION=$(xcodebuild -workspace svekla.xcworkspace -scheme svekla -showBuildSettings | grep MARKETING_VERSION | awk '{print $3}')
echo "📱 Версия: $VERSION"

# Проверяем build номер
BUILD=$(xcodebuild -workspace svekla.xcworkspace -scheme svekla -showBuildSettings | grep CURRENT_PROJECT_VERSION | awk '{print $3}')
echo "🔢 Build: $BUILD"

# Проверяем Team ID
TEAM_ID=$(xcodebuild -workspace svekla.xcworkspace -scheme svekla -showBuildSettings | grep DEVELOPMENT_TEAM | awk '{print $3}')
echo "👥 Team ID: $TEAM_ID"

echo ""
echo "🎯 Рекомендации:"
echo ""

if [ "$BUNDLE_ID" = "com.aksukant.svekla" ]; then
    echo "✅ Bundle Identifier корректный"
else
    echo "⚠️  Bundle Identifier должен быть 'com.aksukant.svekla'"
fi

if [ "$VERSION" = "1.0.0" ]; then
    echo "✅ Версия корректная"
else
    echo "⚠️  Версия должна быть '1.0.0'"
fi

if [ -n "$TEAM_ID" ]; then
    echo "✅ Team ID настроен: $TEAM_ID"
else
    echo "⚠️  Team ID не настроен. Нужно выбрать Apple Developer Account"
fi

echo ""
echo "📝 Следующие шаги:"
echo "1. Откройте svekla.xcworkspace в Xcode"
echo "2. Выберите проект svekla"
echo "3. Вкладка 'Signing & Capabilities'"
echo "4. Убедитесь что:"
echo "   - Team выбран"
echo "   - Bundle Identifier = com.aksukant.svekla"
echo "   - Automatically manage signing включено"
echo ""
echo "5. Создайте иконки из temp/app-icon-square.svg"
echo "6. Разместите иконки в AppIcon.appiconset"
echo "7. Product → Archive → Distribute App"
