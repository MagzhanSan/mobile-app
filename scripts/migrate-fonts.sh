#!/bin/bash

# Скрипт для миграции импортов Text и TextInput на кастомные компоненты

echo "🚀 Начинаем миграцию шрифтов..."

# Находим все TypeScript/JavaScript файлы в src
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    echo "Обрабатываем файл: $file"
    
    # Проверяем, содержит ли файл импорт Text или TextInput из react-native
    if grep -q "import.*{.*Text.*}.*from.*react-native" "$file"; then
        echo "  📝 Найден импорт Text из react-native"
        
        # Создаем резервную копию
        cp "$file" "$file.backup"
        
        # Заменяем импорт Text
        sed -i '' 's/import { \(.*\)Text\(.*\) } from '\''react-native'\''/import { \1 } from '\''react-native'\''\nimport { Text } from '\''..\/components\/CustomText'\''/g' "$file"
        
        # Очищаем лишние запятые
        sed -i '' 's/, ,/,/g' "$file"
        sed -i '' 's/{ ,/{/g' "$file"
        sed -i '' 's/ , }/}/g' "$file"
        
        echo "  ✅ Импорт Text обновлен"
    fi
    
    if grep -q "import.*{.*TextInput.*}.*from.*react-native" "$file"; then
        echo "  📝 Найден импорт TextInput из react-native"
        
        # Создаем резервную копию
        cp "$file" "$file.backup"
        
        # Заменяем импорт TextInput
        sed -i '' 's/import { \(.*\)TextInput\(.*\) } from '\''react-native'\''/import { \1 } from '\''react-native'\''\nimport { TextInput } from '\''..\/components\/CustomText'\''/g' "$file"
        
        # Очищаем лишние запятые
        sed -i '' 's/, ,/,/g' "$file"
        sed -i '' 's/{ ,/{/g' "$file"
        sed -i '' 's/ , }/}/g' "$file"
        
        echo "  ✅ Импорт TextInput обновлен"
    fi
done

echo "🎉 Миграция завершена!"
echo "📋 Проверьте файлы и при необходимости откатите изменения:"
echo "   git checkout -- src/"
echo ""
echo "💡 Для применения изменений перезапустите Metro:"
echo "   npx react-native start --reset-cache"
