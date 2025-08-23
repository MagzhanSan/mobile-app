#!/bin/bash

echo "🔄 Конвертация иконок из RGBA в RGB..."

ICONS_DIR="ios/svekla/Images.xcassets/AppIcon.appiconset"

# Проверяем наличие ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick не установлен. Установите его:"
    echo "   brew install imagemagick"
    exit 1
fi

# Конвертируем все PNG файлы
for file in "$ICONS_DIR"/*.png; do
    if [ -f "$file" ]; then
        echo "Конвертирую: $(basename "$file")"
        # Конвертируем RGBA в RGB с белым фоном
        convert "$file" -background white -alpha remove -alpha off "$file"
    fi
done

echo "✅ Конвертация завершена!"
echo "Проверяем результат..."

# Проверяем результат
for file in "$ICONS_DIR"/*.png; do
    if [ -f "$file" ]; then
        format=$(file "$file" | grep -o "8-bit/color [^,]*" | cut -d' ' -f3)
        echo "$(basename "$file"): $format"
    fi
done
