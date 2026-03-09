// Простой SPA роутер для блогов
class BlogRouter {
    constructor() {
        this.blogs = [];
        this.content = document.getElementById('content');
        this.handleRoute = this.handleRoute.bind(this);
        this.navigate = this.navigate.bind(this);
        window.addEventListener('hashchange', () => this.handleRoute());
        this.init();
    }

    async init() {
        await this.loadBlogs();  // Вызов метода
        this.handleRoute();      // Отображаем текущий маршрут
    }

    async loadBlogs() {
        try {
            const response = await fetch('data/blogs.json');
            const data = await response.json();
            this.blogs = data.blogs;
            console.log('✅ Блоги загружены:', this.blogs);
        } catch (error) {
            console.error('❌ Ошибка загрузки блогов:', error);
            this.blogs = [];
        }
    }

    handleRoute() {
        // Получаем путь из хэша (убираем #)
        const hash = window.location.hash.slice(1) || '/';
        console.log('Текущий путь:', hash);
        
        if (hash === '/') {
            this.renderMainPage();
        } else if (hash.startsWith('/blog/')) {
            const id = parseInt(hash.split('/').pop());
            this.renderBlogPage(id);
        } else {
            this.renderNotFound();
        }
    }

    navigate(path) {
        window.location.hash = path;
    }

    renderMainPage() {
        const blogsHTML = this.blogs.map(blog => {
            const date = new Date(blog.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            return `
            <article class="blog-card">
                <div class="blog-card__image">
                    <img src="${blog.imagePreview}" alt="${blog.title}" class="blog-image">
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
                    <a class="blog-card__button" style="cursor: pointer" target="_blank" onclick="router.navigate('/blog/${blog.id}')">
                        Читать
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `}).join('');

        this.content.innerHTML = `
            <div class="container">
                <!-- Титульник -->
                <div class="section-header">
                    <h1 class="section-title">Блоги</h1>
                </div>

                <!-- Контент -->
                <div class="blog-grid"> ${blogsHTML} </div>
            </div>
        `;
    }

    renderBlogPage(id) {
        const blog = this.blogs.find(b => b.id === id);
        
        if (!blog) {
            this.renderNotFound();
            return;
        }

        this.content.innerHTML = `
            <div class="blog-page">
                <button class="back-button" onclick="router.navigate('/')">← Назад к списку</button>
                <div class="blog-header">
                    <h1>${blog.title}</h1>
                    <div class="blog-meta">
                        <span>📅 Дата: ${blog.date}</span>
                    </div>
                </div>
                <div class="blog-content">
                    ${blog.content}
                </div>
            </div>
        `;
    }

    renderNotFound() {
        this.content.innerHTML = `
            <div class="not-found">
                <h2>404</h2>
                <p>Страница не найдена</p>
                <button class="back-button" onclick="router.navigate('/')">Вернуться на главную</button>
            </div>
        `;
    }
}

const router = new BlogRouter();