// Базовый путь
const BASE_PATH = window.APP_BASE_PATH || ''; 

// SPA роутер
class BlogRouter {
    constructor() {
        this.blogs = [];
        this.content = document.getElementById('content');
        this.handleRoute = this.handleRoute.bind(this);
        this.navigate = this.navigate.bind(this);
    
        this.basePath = BASE_PATH;

        window.addEventListener('hashchange', () => this.handleRoute());
        this.isTransitioning = false;
        this.init();
    }

    async init() {
        await this.loadBlogs(); 
        this.handleRoute();     
    }

    async loadBlogs() {
        try {
            let jsonPath;
            jsonPath = `${BASE_PATH}/data/blogs.json`;

            console.log('📥 Загрузка JSON по пути:', jsonPath);
            

            const response = await fetch(jsonPath);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            
            const data = await response.json();
            console.log('✅ JSON загружен, блогов:', data.blogs.length);
            
            this.blogs = data.blogs;
            this.handleRoute();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки JSON:', error);
            
            try {
                console.log('🔄 Пробуем альтернативный путь...');
                const response = await fetch('/CodeWorkCome/data/blogs.json');
                const data = await response.json();
                this.blogs = data.blogs;
                this.handleRoute();
            } catch (e) {
                console.error('❌ Альтернативный путь тоже не работает:', e);
            }
        }
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        console.log('Текущий путь:', hash);
        
        this.navigateToPage(hash);
    }

    async navigateToPage(hash) {
        // Если уже идет переход - отменяем
        if (this.isTransitioning) {
            // Можно добавить отмену предыдущего перехода
            if (this.transitionTimeout) {
                clearTimeout(this.transitionTimeout);
            }
        }
        
        this.isTransitioning = true;
        
        // 1. Скрываем текущий контент
        this.content.style.opacity = '0';
        this.content.style.transform = 'translateY(10px)';
        this.content.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        
        // 2. Ждем завершения анимации скрытия
        await new Promise(resolve => {
            this.transitionTimeout = setTimeout(resolve, 150);
        });
        
        // 3. Рендерим новый контент (он будет невидимым)
        if (hash === '/') {
            this.renderMainPage();
        } else if (hash.startsWith('/blog/')) {
            const id = parseInt(hash.split('/').pop());
            this.renderBlogPage(id);
        } else {
            this.renderNotFound();
        }
        
        // 4. Прокручиваем страницу вверх (пока контент невидим)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 5. Даем время на прокрутку
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 6. Плавно показываем новый контент
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.content.style.opacity = '1';
                this.content.style.transform = 'translateY(0)';
                
                // Сбрасываем флаги
                this.isTransitioning = false;
                this.transitionTimeout = null;
            });
        });
    }

    navigate(path) {
        window.location.hash = path;
    }


    // ----- Рендеринг страниц
    renderMainPage() {
        const blogsHTML = this.blogs.map(blog => {
            const date = new Date(blog.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const urlImage = `${BASE_PATH}/${blog.imagePreview}`
            
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
                    <a class="blog-card__button" target="_blank" onclick="router.navigate('/blog/${blog.id}')">
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

        const date = new Date(blog.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        this.content.innerHTML = `
            <div class="container-blog">
                <div class="container-upper">
                    <button class="back-button" onclick="router.navigate('/')">← Назад к списку</button>
                    <div class="blog-meta">
                        <span>📅 ${date}</span>
                    </div>
                </div>

                <div class="blog-page" style="animation: fadeInUp 0.1s ease-out">
                    <div class="blog-header">
                        <img src="${blog.imagePreview}" alt="images-system/gamemaker-logo.svg">
                        <h1>${blog.title}</h1>
                    </div>
                    <div class="blog-content">
                        ${blog.content}
                    </div>
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



    // ----- Дополнительные функции 
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

}

document.addEventListener('DOMContentLoaded', () => { window.router = new BlogRouter(); });