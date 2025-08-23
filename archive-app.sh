#!/bin/bash

echo "📦 Создание архива для App Store..."

# Переходим в папку iOS
cd ios

# Очищаем предыдущие сборки
echo "🧹 Очистка предыдущих сборок..."
xcodebuild clean -workspace svekla.xcworkspace -scheme svekla

# Создаем архив
echo "🔨 Создание архива..."
xcodebuild archive \
  -workspace svekla.xcworkspace \
  -scheme svekla \
  -configuration Release \
  -archivePath build/svekla.xcarchive \
  -destination generic/platform=iOS \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

if [ $? -eq 0 ]; then
    echo "✅ Архив успешно создан!"
    echo "📁 Путь к архиву: ios/build/svekla.xcarchive"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Откройте Xcode"
    echo "2. Window → Organizer"
    echo "3. Выберите созданный архив"
    echo "4. Нажмите 'Distribute App'"
    echo "5. Выберите 'App Store Connect'"
    echo "6. Следуйте инструкциям"
else
    echo "❌ Ошибка при создании архива"
    exit 1
fi

