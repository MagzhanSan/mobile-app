#!/bin/bash

echo "🚀 Начинаем сборку релизной версии Android..."

# Очищаем предыдущие сборки
echo "🧹 Очищаем предыдущие сборки..."
cd android
./gradlew clean

# Собираем релизную версию
echo "📦 Собираем релизную версию..."
./gradlew assembleRelease

# Проверяем, что APK создался
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK успешно создан!"
    echo "📁 Путь к APK: android/app/build/outputs/apk/release/app-release.apk"
    echo "📏 Размер APK: $(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)"
else
    echo "❌ Ошибка: APK не создан"
    exit 1
fi

echo "🎉 Сборка Android завершена!"
