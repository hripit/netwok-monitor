import os


def is_binary(file_path):
    """Проверка, является ли файл бинарным"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(1024)
        return False
    except UnicodeDecodeError:
        return True


def merge_all_files(
        root_dir,
        output_file,
        max_depth=2,
        exclude_dirs=None  # Добавлен параметр исключения
):
    exclude_dirs = exclude_dirs or []  # Список папок для исключения

    with open(output_file, 'w', encoding='utf-8') as outfile:
        root_dir = os.path.abspath(root_dir)

        for subdir, _, files in os.walk(root_dir):
            # Проверка на исключенные папки
            if any(excluded in subdir for excluded in exclude_dirs):
                continue

            current_depth = subdir[len(root_dir):].count(os.sep)

            if current_depth > max_depth:
                continue  # Пропускаем глубже указанного уровня

            for file in files:
                if file in ['merge.py', 'package-lock.json']:
                    continue

                file_path = os.path.join(subdir, file)
                rel_path = os.path.relpath(file_path, root_dir)

                # Пропускаем выходной файл
                if file_path == os.path.abspath(output_file):
                    continue

                # Формируем заголовок
                outfile.write('\n')
                outfile.write('#' * 80 + '\n')
                outfile.write(f'# Начало файла: {rel_path}\n')
                outfile.write('#' * 80 + '\n\n')

                # Пытаемся прочитать содержимое
                try:
                    if not is_binary(file_path):
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                    else:
                        outfile.write(f"# БИНАРНЫЙ ФАЙЛ: {file_path}\n")
                except Exception as e:
                    outfile.write(f"# ОШИБКА ЧТЕНИЯ ФАЙЛА: {str(e)}\n")

                print(file_path)

                outfile.write('\n')
                outfile.write('#' * 80 + '\n')
                outfile.write(f'# Конец файла: {rel_path}\n')
                outfile.write('#' * 80 + '\n')

    print(f'Готово! Результат сохранен в: {output_file}')


# Пример использования с исключениями
merge_all_files(
    root_dir='.',  # Корневая директория (текущая)
    output_file='merged.txt',  # Файл для сохранения
    max_depth=3,  # Глубина вложенности
    exclude_dirs=[  # Список папок для исключения
        '__pycache__',
        '.git',
        'venv',
        'node_modules',
        'public',
        '.idea',
    ]
)