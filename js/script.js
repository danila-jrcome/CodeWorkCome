// Функция для загрузки данных из JSON
async function loadBlogs() {
    try {
        // Загружаем JSON файл
        const response = await fetch('data/blogs.json');
        
        // Проверяем, успешно ли загрузился файл
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        
        // Преобразуем ответ в JavaScript объект
        const data = await response.json();

        // Отображаем блоги
        displayBlogs(data.blogs);
        
    } catch (error) {
        // Если ошибка - показываем сообщение
        console.error('Ошибка:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'flex';
    }
}

// Функция для отображения блогов
function displayBlogs(blogs) {
    const grid = document.getElementById('blogGrid');
    
    // Проходим по каждому блогу и создаем HTML
    const blogsHTML = blogs.map(blog => {
        // Создаем теги
        const tagsHTML = blog.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        // Форматируем дату
        const date = new Date(blog.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        return `
            <article class="blog-card">
                <div class="blog-card__image">
                    <img src="${blog.image}" alt="${blog.title}" class="blog-image">
                </div>
                <div class="blog-card__content">
                    <h2 class="blog-card__title">${blog.title}</h2>
                    <p class="blog-card__description">${blog.description}</p>
                </div>
                <div class="blog-card__additional">
                    <div class="blog-card__meta">
                        <span class="blog-card__read-time">
                            <i class="far fa-clock"></i> ${date}
                        </span>
                    </div>
                    <a href="${blog.slug}.html" class="blog-card__button" target="_blank">
                        Читать
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');
    
    // Вставляем все карточки в сетку
    grid.innerHTML = blogsHTML;
}

// Загружаем данные после полной загрузки страницы
document.addEventListener('DOMContentLoaded', loadBlogs);