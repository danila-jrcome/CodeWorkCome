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

        this.footer = document.querySelector('footer');
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

            if (this.footer) { this.footer.style.opacity = '1'; }

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
        
        this.content.style.opacity = '0';
        this.content.style.transform = 'translateY(10px)';
        this.content.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        
        await new Promise(resolve => {
            this.transitionTimeout = setTimeout(resolve, 150);
        });
        
        if (hash === '/') {
            this.renderMainPage();
        } else if (hash.startsWith('/blog/')) {
            const id = parseInt(hash.split('/').pop());
            this.renderBlogPage(id);
        } else {
            this.renderNotFound();
        }
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
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
                        ${date}
                    </div>
                    <a class="blog-card__button" target="_blank" onclick="router.navigate('/blog/${blog.id}')">
                        Читать <i class="fa-solid fa-angle-right"></i></a>
                </div>
            </article>
        `}).join('');

        this.content.innerHTML = `
        <div class="blogs-containter">
            <div class="container">
                <!-- Титульник -->
                <div class="section-header"><h1 class="section-title">Обучающий материал</h1></div>

                <!-- Контент -->
                <div class="blog-grid"> ${blogsHTML} </div>
            </div>

            <!--
            <div class="container">
                <div class="section-header"><h1 class="section-title">Многосерийные курсы</h1></div>
            </div>

            <div class="container">
                <div class="section-header"><h1 class="section-title">Другой полезный материал </h1></div>
            </div>
            -->

            
            <div class="about-me">
                <h2>Так же рассмотрите другие ссылки на меня</h1>
                <a class="social-links" href="https://www.youtube.com/@danila_commit" target="_blank" rel="noopener noreferrer">
                    <img src="images-system/youtube-logo-white.png" style="height: 48px;" alt="Youtube">
                    <p>Ютуб канал с обучающими видеороликами</p>
                </a>
                <a class="social-links" href="https://boosty.to/danila_commit" target="_blank" rel="noopener noreferrer">
                    <img src="images-system/boosty-logo-white.svg" style="height: 48px;" alt="Boosty">
                    <p>Бусти, если желаете материально поддержать</p>
                </a>
            </div>
        </div>
            `;
    }

    // Подсветка кода
    highlightCode() {
        document.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
        });
    }

    async loadBlogContent(contentFile) {
        try {
            const response = await fetch(`data/${contentFile}`);
            const content = await response.text();
            return content;
        } catch (error) {
            console.error('Ошибка загрузки контента:', error);
            return 'Ошибка загрузки контента';
        }
    }

    async renderBlogPage(id) {
        const blog = this.blogs.find(b => b.id === id);
        
        if (!blog) {
            this.renderNotFound();
            return;
        }

        const blogContent = await this.loadBlogContent(blog.content);

        const date = new Date(blog.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        this.content.innerHTML = `
            <div class="container-blog">
                <div class="container-upper">
                    <button class="back-button" onclick="router.navigate('/')"><i class="fa-solid fa-arrow-left"></i> Назад к списку</button>
                    <div class="blog-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${date}</span>
                    </div>
                </div>

                <div class="blog-page" style="animation: fadeInUp 0.1s ease-out">
                    <div class="blog-header">
                        <img src="${blog.imagePreview}" alt="images-system/gamemaker-logo.svg">
                        <h1>${blog.title}</h1>
                    </div>
                    <div class="blog-content">
                        ${this.prepareCodeBlocks(blogContent)}
                    </div>
                </div>
            </div>
        `;

        this.highlightCode(); // Подсветка кода
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



    ///// ----- Дополнительные функции 
    // Плавный скроллинг
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Подготовка блоков кода
    prepareCodeBlocks(content) {
        return content.replace(
            /<pre><code class="(.*?)">(.*?)<\/code><\/pre>/gs,
            (match, language, code) => {
                const metadata = this.parseCodeMetadata(code);
                let cleanCode = code;
                let objectDataHTML = '';
                
                if (metadata) {
                    cleanCode = code.replace(/\/\/Object:.*?(, Event:.*?)?(\r?\n|$)/, '');
                    objectDataHTML = this.createObjectDataHTML(metadata);
                }
                
                const encodedCode = btoa(unescape(encodeURIComponent(cleanCode)));

                return `
                    <div class="code-block-wrapper" data-code-base64="${encodedCode}">
                        <pre>
                            ${objectDataHTML}
                            <code class="${language}">${cleanCode}</code>
                        </pre>

                        <button class="code-block-copy-btn" onclick="router.copyCode(this)"><i class="fa-regular fa-clipboard"></i> Скопировать код</button>
                    </div>
                `;
            }
        );
    }
    parseCodeMetadata(code) {
        const metadataRegex = /\/\/Object:(\w+)(?:,\s*Event:(\w+))?/;
        const match = code.match(metadataRegex);
        if (match) {return { objectName: match[1], eventName: match[2] || null};}
        
        return null;
    }
    createObjectDataHTML(metadata) 
    {
        const eventIcon = metadata.eventName ? this.getEventIcon(metadata.eventName.toLowerCase()) : 'icon_event_step.png';
        
        return `
            <div class="code-block-metadata">
                <div class="data-container">
                    <img src="images-system/gml-icon/icon_object.png" alt="Объект">
                    <p>${metadata.objectName}</p>
                </div>

                ${metadata.eventName ? `
                <div class="data-container">
                    <img src="images-system/gml-icon/${eventIcon}" alt="Событие">
                    <p>${metadata.eventName}</p>
                </div>
            </div>
            ` : ''}
        `;
    }

    getEventIcon(eventName) 
    {
        const eventIcons = {
            'create': 'icon_event_create.png',
            'step': 'icon_event_step.png',
            'draw': 'icon_event_draw.png',
            'destroy': 'icon_event_destroy.png',
            'collision': 'icon_event_collision.png',
            'alarm': 'icon_event_alarm.png',
            'keyboard': 'icon_event_keyboard.png',
            'mouse': 'icon_event_mouse.png',
            'room_start': 'icon_event_room_start.png',
            'room_end': 'icon_event_room_end.png',
            'animation_end': 'icon_event_animation_end.png',
            'path_end': 'icon_event_path_end.png',
            'user': 'icon_event_user.png'
        };
        
        return eventIcons[eventName.toLowerCase()] || 'icon_event_step.png';
    }

    // Экранирования HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Копирование кода
    copyCode(button) {
        const wrapper = button.closest('.code-block-wrapper');
        const encodedCode = wrapper.dataset.codeBase64;
        const decodedCode = decodeURIComponent(escape(atob(encodedCode)))
        
        // Копируем в буфер обмена
        if (button.disabled == false)
        {
            navigator.clipboard.writeText(decodedCode).then(() => {
                const originalHTML = button.innerHTML;
                button.disabled = true;

                button.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Скопировано в буфер обмена!';
                setTimeout(() => { button.innerHTML = originalHTML; button.disabled = false; }, 2300);
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                alert('Не удалось скопировать код');
            });
        }
    }

}

document.addEventListener('DOMContentLoaded', () => { window.router = new BlogRouter(); });
