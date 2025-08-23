#!/bin/bash

echo "🚀 Начинаем сборку релизной версии iOS..."

# Переходим в папку iOS
cd ios

# Устанавливаем Pods если нужно
echo "📦 Проверяем Pods..."
if [ ! -d "Pods" ]; then
    echo "📦 Устанавливаем Pods..."
    pod install
fi

# Очищаем предыдущие сборки
echo "🧹 Очищаем предыдущие сборки..."
xcodebuild clean -workspace svekla.xcworkspace -scheme svekla

# Собираем релизную версию
echo "📦 Собираем релизную версию..."
xcodebuild archive \
    -workspace svekla.xcworkspace \
    -scheme svekla \
    -configuration Release \
    -archivePath build/svekla.xcarchive \
    -destination generic/platform=iOS

# Проверяем, что архив создался
if [ -d "build/svekla.xcarchive" ]; then
    echo "✅ iOS архив успешно создан!"
    echo "📁 Путь к архиву: ios/build/svekla.xcarchive"
else
    echo "❌ Ошибка: iOS архив не создан"
    exit 1
fi

echo "🎉 Сборка iOS завершена!"
echo "📝 Для загрузки в App Store используйте Xcode -> Product -> Archive"
