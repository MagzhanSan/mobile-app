# Шрифты Noto Sans в проекте Svekla

## ✅ Статус: Полностью подключено и работает везде

В проект подключены следующие шрифты Noto Sans:

### Основные шрифты
- `NotoSans-Regular` - обычный шрифт
- `NotoSans-Bold` - жирный шрифт
- `NotoSans-Medium` - средний шрифт
- `NotoSans-Light` - светлый шрифт
- `NotoSans-Italic` - курсив

### Переменные шрифты (для поддержки различных весов)
- `NotoSans-VariableFont_wdth,wght` - переменный шрифт
- `NotoSans-Italic-VariableFont_wdth,wght` - переменный курсив

## 🚀 Автоматическое применение шрифтов

Шрифты теперь применяются автоматически ко всем текстовым элементам через кастомные компоненты!

## Использование

### 🎯 Рекомендуемый способ (автоматический)

```typescript
// Просто используйте кастомные компоненты
import { Text, TextInput } from '../components/CustomText';

// Шрифт применяется автоматически!
<Text>Этот текст будет использовать Noto Sans</Text>
<TextInput placeholder="Введите текст" />
```

### 1. Импорт констант

```typescript
import { FONTS } from '../consts/fonts';
import { STYLES } from '../consts/styles';
```

### 2. Прямое использование шрифтов

```typescript
<Text style={{ fontFamily: FONTS.notoSansRegular }}>
  Обычный текст
</Text>

<Text style={{ fontFamily: FONTS.notoSansBold }}>
  Жирный текст
</Text>
```

### 3. Использование готовых стилей

```typescript
// Основные текстовые стили
<Text style={STYLES.text.regular}>Обычный текст</Text>
<Text style={STYLES.text.bold}>Жирный текст</Text>
<Text style={STYLES.text.medium}>Средний текст</Text>
<Text style={STYLES.text.light}>Светлый текст</Text>
<Text style={STYLES.text.italic}>Курсивный текст</Text>

// Заголовки
<Text style={STYLES.heading.h1}>Заголовок H1</Text>
<Text style={STYLES.heading.h2}>Заголовок H2</Text>
<Text style={STYLES.heading.h3}>Заголовок H3</Text>

// Кнопки
<Text style={STYLES.button.primary}>Кнопка</Text>
<Text style={STYLES.button.secondary}>Вторичная кнопка</Text>

// Поля ввода
<TextInput style={STYLES.input} />

// Подписи
<Text style={STYLES.caption}>Подпись</Text>

// Загрузка
<Text style={STYLES.loading}>Загрузка...</Text>
```

## Файлы конфигурации

### Android
Шрифты находятся в: `android/app/src/main/assets/fonts/`

### iOS
Шрифты находятся в: `ios/svekla/Fonts/`

### React Native Config
Конфигурация в: `react-native.config.js`

## 🛠️ Миграция существующего кода

### Автоматическая миграция

Запустите скрипт для автоматической миграции всех файлов:

```bash
./scripts/migrate-fonts.sh
```

### Ручная миграция

1. Замените импорты в файлах:
```typescript
// Было
import { Text, TextInput } from 'react-native';

// Стало
import { Text, TextInput } from '../components/CustomText';
```

2. Удалите явные `fontFamily` из стилей (если есть)

## Тестирование

Для тестирования шрифтов используйте компонент `FontTest`:

```typescript
import FontTest from '../components/FontTest';

// В вашем экране
<FontTest />
```

## Добавление новых шрифтов

1. Скопируйте файл шрифта в папку `src/assets/Noto_Sans/`
2. Добавьте константу в `src/consts/fonts.ts`
3. Скопируйте файл в папки Android и iOS
4. Перезапустите приложение

## Примечания

- Шрифты поддерживают кириллицу и латиницу
- Переменные шрифты позволяют использовать различные веса без загрузки отдельных файлов
- Все шрифты оптимизированы для мобильных устройств
