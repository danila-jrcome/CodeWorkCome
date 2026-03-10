// Простой SPA роутер для блогов
class BlogRouter {
    constructor() {
        this.blogs = [];
        this.content = document.getElementById('content');
        this.handleRoute = this.handleRoute.bind(this);
        this.navigate = this.navigate.bind(this);
        window.addEventListener('hashchange', () => this.handleRoute());
        this.isTransitioning = false;
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
        
        this.transitionTo(() => {
            if (hash === '/') {
                this.renderMainPage();
            } else if (hash.startsWith('/blog/')) {
                const id = parseInt(hash.split('/').pop());
                this.renderBlogPage(id);
            } else {
                this.renderNotFound();
            }
        });
    }

    async transitionTo(callback) {
    // Если уже идет переход - выходим
    if (this.isTransitioning) return;
    
    // Ставим флаг
    this.isTransitioning = true;
    
    // Добавляем класс для исчезновения
    this.content.classList.add('fade-out');
    
    // Ждем 150мс (время анимации исчезновения)
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Выполняем рендеринг (то, что пришло в callback)
    callback();
    
    // ХИТРЫЙ МОМЕНТ: два requestAnimationFrame чтобы дать браузеру время
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Убираем класс исчезновения - элемент появляется
            this.content.classList.remove('fade-out');
            // Снимаем флаг
            this.isTransitioning = false;
        });
    });
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
}

const router = new BlogRouter();


// Функция для проверки путей
function checkPaths() {
    console.log('🔍 ПРОВЕРКА ПУТЕЙ:');
    console.log('Текущий URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    // Проверяем CSS
    const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('\n📁 CSS файлы:');
    cssFiles.forEach((css, i) => {
        console.log(`${i+1}. ${css.href} - ${css.href ? '✅' : '❌'}`);
    });
    
    // Проверяем JS
    const jsFiles = document.querySelectorAll('script[src]');
    console.log('\n📁 JS файлы:');
    jsFiles.forEach((js, i) => {
        console.log(`${i+1}. ${js.src} - ${js.src ? '✅' : '❌'}`);
    });
    
    // Проверяем, загрузился ли JSON
    fetch('data/blogs.json')
        .then(r => r.json())
        .then(data => console.log('\n✅ JSON загружен:', data.blogs.length, 'блогов'))
        .catch(e => console.log('\n❌ JSON не загружен:', e));
}

// Запускаем проверку
checkPaths();