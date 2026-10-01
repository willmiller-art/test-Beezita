// =====================================================================
// IDENTIFICAÇÃO DE SISTEMA (DESKTOP VS MOBILE/TABLET)
// =====================================================================
const isWindows = /Windows/i.test(navigator.userAgent);
const isMac = /Macintosh/i.test(navigator.userAgent);

// A prova real de que é um computador (e não um iPad moderno fingindo ser Mac) 
// é verificar se a tela NÃO possui capacidade de toque.
const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Se for Windows ou Mac E não tiver tela de toque, aplica o carimbo.
if ((isWindows || isMac) && !isTouchDevice) {
    document.body.classList.add('modo-desktop');
}
// =====================================================================

// --- GERENCIAMENTO DE NAVEGAÇÃO E TRANSIÇÃO ---
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const sections = document.querySelectorAll('.content-section');
let isTransitioning = false;

const pagesOrder = ['home', 'desafio', 'colecao', 'rota'];

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.getAttribute('data-section');
        if (!targetPage || isTransitioning) return;
        
        if (isMenuOpen) toggleMenu();
        if (isAccessOpen) toggleAccessPanel();

        item.classList.add('btn-pulse');
        setTimeout(() => item.classList.remove('btn-pulse'), 150);

        if (item.classList.contains('active')) return;

        loadPage(targetPage);
    });
});

function updateCaput(pageId) {
    const brandTitle = document.querySelector('.top-header .brand-title');
    if (!brandTitle) return;

    // Ao SAIR da Trilha: cria um "fantasma" da cápsula que apaga suavemente
    // (mesmo comportamento da pílula da direita). Se algo falhar, a troca de aba segue normal.
    try {
        if (pageId !== 'home' && brandTitle.querySelector('.bee-logo')) {
            const header = brandTitle.closest('.top-header');
            const r = brandTitle.getBoundingClientRect();
            const h = header.getBoundingClientRect();
            const fantasma = brandTitle.cloneNode(true);
            fantasma.classList.add('brand-title-fantasma');
            fantasma.setAttribute('aria-hidden', 'true');
            fantasma.style.left = (r.left - h.left) + 'px';
            fantasma.style.top = (r.top - h.top) + 'px';
            fantasma.style.width = r.width + 'px';
            fantasma.style.height = r.height + 'px';
            header.appendChild(fantasma);
            setTimeout(() => fantasma.remove(), 350);
        }
    } catch (e) { /* ignora: não pode atrapalhar a troca de aba */ }

    if (pageId === 'home') {
        brandTitle.innerHTML = `
            <div class="custom-bee-icon bee-logo"></div>
            <h1>BEEZITA</h1>
        `;
    } else if (pageId === 'desafio') {
        brandTitle.innerHTML = `<h1 class="caput-title" data-i18n="nav_discover">Desafio</h1>`;
    } else if (pageId === 'colecao') {
        brandTitle.innerHTML = `<h1 class="caput-title" data-i18n="nav_collection">Coleção</h1>`;
    } else if (pageId === 'rota') {
        brandTitle.innerHTML = `<h1 class="caput-title" data-i18n="nav_mhnjb">MHNJB</h1>`;
    }
}

function loadPage(pageId) {
    const currentSection = document.querySelector('.content-section.active');
    const targetSection = document.getElementById(`section-${pageId}`);
    
    if (!targetSection || currentSection === targetSection) return;
    isTransitioning = true;

    document.querySelector('.bottom-nav .nav-item.active')?.classList.remove('active');
    document.querySelector(`.bottom-nav .nav-item[data-section="${pageId}"]`)?.classList.add('active');

    updateCaput(pageId);
    
    const langAtual = localStorage.getItem('beezita_lang') || 'pt';
    aplicarIdioma(langAtual);

    currentSection.classList.remove('active');
    targetSection.classList.add('active');

    // --- MÁGICA AQUI: Controla a visibilidade do cabeçalho nas outras abas ---
    const overlayAberto = document.getElementById('discovery-overlay').classList.contains('active');
    if (pageId === 'home' && overlayAberto) {
        document.body.classList.add('recompensa-ativa'); // Esconde o cabeçalho apenas na Trilha
    } else {
        document.body.classList.remove('recompensa-ativa'); // Devolve o cabeçalho nas outras abas
    }
    // -------------------------------------------------------------------------

    setTimeout(() => {
        isTransitioning = false;
    }, 300);
}

// --- LÓGICA DE OVERLAY E MENU (BOTTOM SHEET) ---
const topMenuBtn = document.querySelector('.top-header .top-menu-btn');
const menuOverlay = document.getElementById('menu-overlay');
let isMenuOpen = false;
let isAccessOpen = false; 

topMenuBtn.addEventListener('click', () => {
    if (isAccessOpen) toggleAccessPanel(); 
    else toggleMenu(); 
});

menuOverlay.addEventListener('click', () => {
    if (isAccessOpen) toggleAccessPanel();
    if (isMenuOpen) toggleMenu();
});

function toggleMenu() {
    if (isAccessOpen) {
        isAccessOpen = false;
        document.body.classList.remove('access-open');
    }
    if (isLayersOpen) {
        isLayersOpen = false;
        document.body.classList.remove('layers-open');
    }

    isMenuOpen = !isMenuOpen;
    document.body.classList.toggle('menu-open', isMenuOpen);
    
    if (isMenuOpen) {
        topMenuBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        topMenuBtn.setAttribute('aria-label', 'Fechar Menu');
    } else {
        topMenuBtn.innerHTML = '<i class="bi bi-list"></i>';
        topMenuBtn.setAttribute('aria-label', 'Abrir Menu');
    }
}

document.querySelector('#side-menu .access-close')?.addEventListener('click', toggleMenu);

document.querySelectorAll('#side-menu .menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('data-page');
        if (item.classList.contains('active') || !pageId || isTransitioning) return;
        
        toggleMenu(); 
        loadPage(pageId);
        
        document.querySelector('#side-menu .menu-item.active')?.classList.remove('active');
        item.classList.add('active');
    });
});

// --- LÓGICA DO PAINEL DE ACESSIBILIDADE ---
const closeAccessBtn = document.getElementById('close-access-btn');

function toggleAccessPanel() {
    if (isMenuOpen) toggleMenu();
    if (isLayersOpen) {
        isLayersOpen = false;
        document.body.classList.remove('layers-open');
    }

    isAccessOpen = !isAccessOpen;
    document.body.classList.toggle('access-open', isAccessOpen);

    if (isAccessOpen) {
        topMenuBtn.innerHTML = '<i class="bi bi-arrow-left"></i>';
        topMenuBtn.setAttribute('aria-label', 'Voltar');
    } else {
        topMenuBtn.innerHTML = '<i class="bi bi-list"></i>';
        topMenuBtn.setAttribute('aria-label', 'Abrir Menu');
    }
}

document.querySelectorAll('.accessibility-btn, .accessibility-btn-menu').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isMenuOpen) toggleMenu();
        setTimeout(() => toggleAccessPanel(), isMenuOpen ? 200 : 0);
    });
});

closeAccessBtn.addEventListener('click', toggleAccessPanel);

// --- SISTEMA DE MEMÓRIA E CONTROLE DE FONTE ---
const fontButtons = document.querySelectorAll('.font-size-control .segment-btn');

function aplicarTamanhoFonte(scale) {
    // Aplica o tamanho real na raiz do documento
    document.documentElement.style.fontSize = `${16 * scale}px`;
    // Salva a escolha na memória do celular
    localStorage.setItem('beezita_font_scale', scale);
    
    // Atualiza a interface (a classe active vai para o botão correto)
    fontButtons.forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-scale') === scale) {
            b.classList.add('active');
        }
    });
}

// Ouve o clique do usuário
fontButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const scale = btn.getAttribute('data-scale');
        aplicarTamanhoFonte(scale);
    });
});

// Ao iniciar o app, puxa a fonte salva da memória (ou usa 1.0 como padrão de fábrica)
const fonteSalva = localStorage.getItem('beezita_font_scale') || '1.0';
aplicarTamanhoFonte(fonteSalva);

const contrastButtons = document.querySelectorAll('.contrast-control .segment-btn');
contrastButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        contrastButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const contrastType = btn.getAttribute('data-contrast');
        
        document.body.classList.remove('access-high-contrast');
        if (contrastType === 'high') {
            document.body.classList.add('access-high-contrast');
        }
    });
});

// =========================================================
// CONTROLE DE APARÊNCIA E TROCA DO MAPA (REATIVO AO SISTEMA)
// =========================================================
const modeButtons = document.querySelectorAll('.mode-control .segment-btn');

function aplicarTemaMapa(temaResolvido) {
    if (typeof mapTileLayer !== 'undefined' && mapTileLayer) {
        const token = 'pk.eyJ1Ijoid2lsc2kyNDQiLCJhIjoiY21wNzB0Mjh4MDF2aDJwcHRucnEzbW9sMyJ9.E8maQPtBHhWt4-TNZXt--w';
        
        let corTrilhaPrincipal = '#FFD15C';
        let corTrilhaSecundaria = 'var(--warm-cream)';
        let corAbelha = 'var(--honey-yellow)';
        let filtroAbelha = 'drop-shadow(0 0 10px var(--glow-yellow))';

        if (temaResolvido === 'light') {
            // Mapa Claro Customizado
            mapTileLayer.setUrl(`https://api.mapbox.com/styles/v1/wilsi244/cmpbcbsdq001801ry1ipk8ida/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`);
            corTrilhaPrincipal = '#ECB431'; 
            corTrilhaSecundaria = '#8F876E'; 
            corAbelha = '#ECB431';
            filtroAbelha = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';
        } else {
            // Mapa Escuro Customizado (Padrão)
            mapTileLayer.setUrl(`https://api.mapbox.com/styles/v1/wilsi244/cmpbsrijn007n01s1exze9lik/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`);
        }

        // Repinta as linhas da trilha dinamicamente mantendo a espessura e tracejado estáveis
        if (typeof camadaTrilhasGeoJSON !== 'undefined' && camadaTrilhasGeoJSON) {
            camadaTrilhasGeoJSON.setStyle(function (feature) {
                const nomeTrilha = (feature.properties && feature.properties.name) ? feature.properties.name : "";
                if (nomeTrilha === "Trilha da Polinização MHNJB") {
                    let cor = isTrailStarted ? '#FFD15C' : 'var(--warm-cream)';
                    if (temaResolvido === 'light') {
                        // Terracota (#9C5838) se ativa no modo claro, Cinza/Fendi (#8F876E) se inativa (igual às outras)
                        cor = isTrailStarted ? '#9C5838' : '#8F876E'; 
                    }
                    return { 
                        color: cor,
                        weight: isTrailStarted ? 4 : 2, 
                        opacity: isTrailStarted ? 0.8 : 0.35, 
                        dashArray: isTrailStarted ? '8, 12' : '3, 6' 
                    };
                } else {
                    return { 
                        color: temaResolvido === 'light' ? '#8F876E' : 'var(--warm-cream)', 
                        weight: 2, 
                        opacity: 0.35, 
                        dashArray: '3, 6' 
                    };
                }
            });
        }

        // Adapta o brilho de fundo do marcador do usuário conforme o tema
        if (typeof marcadorUsuario !== 'undefined' && marcadorUsuario) {
            const iconBolinhaAtualizado = L.divIcon({
                className: 'gps-blue-dot-marker',
                html: `
                    <div style="
                        position: relative;
                        width: 18px; height: 18px;
                        background-color: #007AFF;
                        border: 2.5px solid #FFFFFF;
                        border-radius: 50%;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                        display: flex; align-items: center; justify-content: center;
                    ">
                        <div style="
                            position: absolute;
                            width: 36px; height: 36px;
                            background-color: ${temaResolvido === 'light' ? 'rgba(0, 122, 255, 0.35)' : 'rgba(0, 122, 255, 0.25)'};
                            border-radius: 50%;
                            z-index: -1;
                            animation: pulse-pino 2s infinite ease-in-out;
                            filter: ${filtroAbelha};
                        "></div>
                    </div>
                `,
                iconSize: [36, 36], 
                iconAnchor: [18, 18] 
            });
            marcadorUsuario.setIcon(iconBolinhaAtualizado);
        }
    }
}

// 1. O motor que escuta o celular em tempo real e muda sozinho
const mediaQueryCor = window.matchMedia('(prefers-color-scheme: light)');

function monitorarMudancaSistema(e) {
    const btnSistemaAtivo = document.querySelector('.mode-control .segment-btn[data-mode="system"]').classList.contains('active');
    
    // Só altera o mapa automaticamente se a opção "Sistema" estiver selecionada
    if (btnSistemaAtivo) {
        aplicarTemaMapa(e.matches ? 'light' : 'dark');
    }
}

// Liga o "espião" no navegador
mediaQueryCor.addEventListener('change', monitorarMudancaSistema);

// 2. A lógica do clique do usuário
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Tira o amarelo dos outros e põe no clicado
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const modoEscolhido = btn.getAttribute('data-mode');
        
        if (modoEscolhido === 'system') {
            // Vai no celular agora mesmo e pergunta: "Você está no claro ou escuro?"
            const isLight = mediaQueryCor.matches;
            aplicarTemaMapa(isLight ? 'light' : 'dark');
        } else if (modoEscolhido === 'light') {
            aplicarTemaMapa('light');
        } else {
            aplicarTemaMapa('dark'); // 'default'
        }
    });
});

// Ao carregar a página, identifica o botão ativo e aplica o tema correspondente
document.addEventListener("DOMContentLoaded", () => {
    const btnAtivo = document.querySelector('.mode-control .segment-btn.active');
    if (!btnAtivo) return;

    const modo = btnAtivo.getAttribute('data-mode');

    if (modo === 'system') {
        aplicarTemaMapa(mediaQueryCor.matches ? 'light' : 'dark');
    } else if (modo === 'light') {
        aplicarTemaMapa('light');
    } else {
        aplicarTemaMapa('dark');
    }
});

const switchBold = document.getElementById('switch-bold');
if(switchBold) {
    switchBold.addEventListener('change', (e) => {
        document.body.classList.toggle('access-bold-text', e.target.checked);
    });
}

// --- LÓGICA DE PAN DO MAPA ---
function setupMapPan(viewportId, contentClass) {
    const viewport = document.querySelector(`#${viewportId} .map-viewport`) || document.getElementById(viewportId);
    if (!viewport) return;
    const content = viewport.querySelector(`.${contentClass}`);
    if (!content) return;

    let isDragging = false; let startX, startY;
    const style = window.getComputedStyle(content);
    const matrix = new WebKitCSSMatrix(style.transform);
    let translateX = matrix.m41; let translateY = matrix.m42;
    const scale = 1; 

    function updateTransform() { content.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`; }

    function limitPan() {
        const maxPanX = 50;
        const minPanX = -(content.offsetWidth - viewport.offsetWidth + 50);
        const maxPanY = 50;
        const minPanY = -(content.offsetHeight - viewport.offsetHeight + 100);
        if (translateX > maxPanX) translateX = maxPanX;
        if (translateX < minPanX) translateX = minPanX;
        if (translateY > maxPanY) translateY = maxPanY;
        if (translateY < minPanY) translateY = minPanY;
    }

    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.marker, .map-control-btn, .selo-card, .especie-card')) return; 
        isDragging = true; viewport.style.cursor = 'grabbing';
        startX = e.clientX - translateX; startY = e.clientY - translateY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX; translateY = e.clientY - startY;
        limitPan(); updateTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; viewport.style.cursor = 'grab'; });

    viewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('.marker, .map-control-btn, .selo-card, .especie-card')) return;
        if (e.touches.length === 1) {
            isDragging = true; startX = e.touches[0].clientX - translateX; startY = e.touches[0].clientY - translateY;
        }
    });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        translateX = e.touches[0].clientX - startX; translateY = e.touches[0].clientY - startY;
        limitPan(); updateTransform();
    });

    viewport.addEventListener('touchend', () => isDragging = false);
}

if (document.getElementById('section-home')) setupMapPan('section-home', 'current-map-1');
if (document.getElementById('section-rota')) setupMapPan('section-rota', 'current-map-2');

// --- INICIALIZAÇÕES COMPLEMENTARES ---
function setupTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const tabBtns = container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
        });
    });
}
setupTabs('section-rota'); setupTabs('section-colecao');

document.querySelectorAll('.marker.hexagon-marker, .estacao-card, .selo-card, .view-all-link, .saberes-btn').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        if(item.id === 'close-menu-header') return;
    });
});

const especieCards = document.querySelectorAll('#section-colecao .especie-card');
especieCards.forEach(card => {
    card.addEventListener('click', () => {
        especieCards.forEach(c => c.classList.remove('focused'));
        card.classList.add('focused');
    });
});

window.addEventListener('resize', () => {
    setupMapPan('section-home', 'current-map-1');
    setupMapPan('section-rota', 'current-map-2');
});


// --- SISTEMA DE INTERNACIONALIZAÇÃO (i18n) ---
const dicionario = {
    pt: {
        slogan: "EXPLORE O MHNJB COM AS ABELHAS!", 
        start_trail: "COMEÇAR TRILHA", 
        welcome_title: "Bem-vindo(a) ao MHNJB!",
        available_trail: "Trilha autoguiada disponível:",
        btn_start_trail: "COMEÇAR",
        trail_name: "Trilha da Polinização",
        warn_dont_touch: "As abelhas nativas não picam!<br>Para o bem-estar delas, <strong>apenas observe e não toque nas caixas</strong>.",
        close_btn: "FECHAR",
        follow_trail_to: "SIGA A TRILHA ATÉ",
        stations_visited: "estações visitadas",
        i_am_here: "ESTOU AQUI",
        btn_exit: "SAIR",
        new_discovery: "Nova descoberta!",
        trail_started: "INÍCIO DA TRILHA", 
        go_to_gate: "VÁ ATÉ A PORTARIA 1", 
        go_to_gate_expanded: "VÁ ATÉ A PORTARIA 1 DO MHNJB",
        nav_go_to_meliponary: "VÁ ATÉ O MELIPONÁRIO",
        nav_trail: "Trilha", 
        nav_discover: "Desafio", 
        nav_collection: "Coleção", 
        nav_mhnjb: "MHNJB", 
        nav_faq: "Perguntas Frequentes", 
        menu_sub: "Explore o MHNJB com as abelhas", 
        menu_info: "Informações", 
        settings_title: "Configurações", 
        set_sys: "SISTEMA", 
        set_eco: "Modo Econômico", 
        set_gps: "GPS e Localização", 
        set_vib: "VIBRAÇÃO", 
        set_haptic: "Feedback tátil", 
        set_pref: "PREFERÊNCIAS", 
        set_lang: "Idioma", 
        set_data: "GERENCIAR DADOS", 
        set_reset_trail: "Apagar Progresso da Trilha", 
        set_reset_col: "Limpar Coleção Desbloqueada", 
        modal_sure: "Tem certeza?", 
        modal_no: "Não", 
        modal_yes: "Sim, apagar", 
        set_offline_map: "Baixar Mapa Offline",
        set_offline_map_done: "Mapa Offline Baixado",
        set_delete: "EXCLUIR",
        eco_title: "Modo Econômico", 
        eco_anim: "Reduzir animações", 
        eco_desc: "Ativar esta opção reduz os efeitos visuais para economizar bateria.", 
        gps_title: "Localização", 
        gps_allow: "Permitir acesso à localização", 
        gps_prec: "Melhorar precisão da localização", 
        gps_desc: "A precisão melhorada utiliza conexões próximas (como Wi-Fi e Bluetooth) para referenciar geograficamente sua posição exata no museu.", 
        lang_name: "Português", 
        desc_apagar: "Você está prestes a apagar o progresso da trilha. Isso não pode ser desfeito.", 
        desc_limpar: "Você está prestes a limpar a coleção desbloqueada. Isso não pode ser desfeito.", 
        faq_q1: "Como funcionam as estações?", 
        faq_a1: "A trilha é autoguiada. Ao passar por cada estação, marque manualmente no mapa a sua visita clicando em \"Estou aqui\" e siga as instruções na tela. A cada estação, uma nova descoberta.", 
        faq_q2: "O app funciona sem internet?", 
        faq_a2: "Sim! Nas configurações do aplicativo é possível baixar o mapa para uso offline. A localização em tempo real fica menos precisa e a temperatura local fica indisponível.",
        faq_q3: "Quanto custa o ingresso?", 
        faq_a3: "Visita espontânea: gratuito. Visita agendada em grupo: R$ 12,00 por visitante. Descontos para instituições públicas. Isentos: estudantes/professores UFMG e acima de 60 anos.", 
        faq_q4: "As abelhas da trilha podem picar? É seguro?",
        faq_a4: "É totalmente seguro! O app foca nas espécies nativas brasileiras 'sem ferrão'. Elas são inofensivas e não picam. Apenas pedimos para não tocar nas caixas.",
        faq_q5: "É necessário agendar visita?", 
        faq_a5: "Para grupos com mais de 10 pessoas é indispensável. Para visitas individuais ou espontâneas, não é necessário.", 
        faq_q6: "Por que o agendamento é indispensável?", 
        faq_a6: "Para garantir a segurança, organização e não impactar a capacidade limitada dos espaços fechados.", 
        faq_q7: "Qual o horário de funcionamento?", 
        faq_a7: "Quarta a sábado: 8h30 às 16h (permanência até 17h). Fechado em feriados nacionais e municipais.", 
        faq_q8: "Como chegar ao MHNJB?", 
        faq_a8: "Endereço: Rua Gustavo da Silveira, 1035 - Santa Inês. Metrô: Estação Santa Inês. Ônibus: 4802A, 8001A, 9105, 9205, 9402.", 
        continue_trail: "CONTINUE PELA TRILHA", 
        click_expand: "CLIQUE PARA EXPANDIR", 
        menu_sec: "Dicas de Segurança", 
        made_with: "Feito com", 
        in_bh: "em Belo Horizonte - MG", 
        acc_title: "Acessibilidade", 
        acc_sub: "Torne sua experiência mais confortável.", 
        acc_size: "TAMANHO DO TEXTO", 
        acc_contrast: "CONTRASTE", 
        acc_cont_def: "Padrão", 
        acc_cont_high: "Alto contraste", 
        acc_map: "APARÊNCIA DO MAPA", 
        acc_map_light: "Claro", 
        acc_map_dark: "Escuro", 
        acc_map_sys: "Sistema", 
        acc_bold: "Texto em negrito", 
        acc_motion: "Reduzir movimento", 
        layer_title: "Ver no mapa", 
        layer_sub: "Encontre e explore locais no mapa.", 
        cat_expo: "Exposições", 
        cat_bees: "Abelhas", 
        cat_trees: "Árvores Notáveis", 
        cat_gardens: "Jardins Especiais", 
        cat_leisure: "Lazer", 
        cat_canteen: "Cantina", 
        cat_water: "Bebedouros", 
        cat_restroom: "Sanitários", 
        cat_gate: "Portarias", 
        info_help: "AJUDA", 
        info_how_map: "Como usar o App", 
        tut_intro: "O Beezita é o seu guia digital de bolso. Veja as principais funções:",
        tut_trail_title: "Trilha da Polinização",
        tut_trail_desc: "Navegue pelo mapa seguindo a linha tracejada. Ao chegar em um ponto, clique em \"ESTOU AQUI\" para desbloquear cartas e desafios.",
        tut_map_title: "Exploração Livre",
        tut_map_desc: "Use o botão de binóculos no mapa para ativar o \"Ver no mapa\". Ele destaca exposições, árvores notáveis e utilidades próximas a você.",
        tut_col_title: "Diário de Bordo",
        tut_col_desc: "Cada descoberta na trilha fica salva na aba 'Coleção'. Revise o que aprendeu mesmo quando estiver offline.",
        tut_muse_title: "O Museu (MHNJB)",
        tut_muse_desc: "Na aba MHNJB, você encontra detalhes de funcionamento, ingressos e a história do Jardim Botânico.",
        sec_title: "Segurança", 
        sec_group: "DICAS DE SEGURANÇA", 
        sec_1: "Leve repelente", 
        sec_2: "Use protetor solar", 
        sec_3: "Não toque nas caixas de abelha", 
        sec_4: "Não coletar plantas ou itens", 
        sec_5: "Mantenha silêncio e respeite", 
        sec_6: "Calçado fechado e calças", 
        sec_7: "Se necessário, procure ajuda", 
        toast_far: "Ops, parece que você está longe. Use essa opção quando estiver no MHNJB.", 
        toast_gps_denied: "Permita a localização no navegador para centralizar.", 
        toast_trail_cleared: "Progresso da Trilha apagado.", 
        toast_col_cleared: "Coleção inteira limpa com sucesso.",
        mhnjb_tag: "MHNJB - ESPAÇO DE SABERES", 
        mhnjb_title: "Museu de História Natural e Jardim Botânico da UFMG", 
        mhnjb_func_title: "Funcionamento", 
        mhnjb_func_text: "Quarta a sábado, das 8h30 às 16h (permanência até as 17h). Fechado em feriados.", 
        mhnjb_ent_title: "Entrada", 
        mhnjb_ent_text: "Visita espontânea gratuita. Grupos com mais de 10 pessoas exigem agendamento prévio.", 
        mhnjb_site: "VISITAR O SITE OFICIAL", 
        mhnjb_hist_title: "HISTÓRIA E MISSÃO", 
        mhnjb_hist_p1: "Situado na cidade de Belo Horizonte/MG e fundado em 1969, o Museu de História Natural e Jardim Botânico da UFMG tem a missão de ser um espaço de encontro de saberes, com o objetivo de contribuir para a construção de conhecimentos sobre o patrimônio cultural e ambiental por meio da valorização de suas coleções, ações educativas, exposições e pesquisa.", 
        mhnjb_hist_p2: "É aberto à visitação, onde o público encontra exposições nas áreas de Arqueologia, Botânica, Cartografia Histórica, Documentação Bibliográfica e Arquivística, o Presépio do Pipiripau, trilhas na mata, fauna e flora local, e muito mais.", 
        poi_visited: "Visitado", 
        poi_mark_visited: "Marcar como visitado", 
        poi_see_more: "Ver mais", 
        poi_bee_house: "Casa de abelha", 
        poi_bee_hotel: "Hotel para abelhas solitárias", 
        poi_meliponary: "Meliponário",
        col_tab_all: "Todos",
        col_tab_bees: "Abelhas",
        col_tab_expo: "Exposições",
        col_tab_others: "Outros",
        col_logbook: "MEU DIÁRIO DE BORDO",
        col_discovered: "descobertos",
        col_of: "de",
        game_tab_quiz: "Quiz: Abelhas",
        game_tab_cur: "Curiosidades MHNJB",
        game_cards: "cartas",
        game_title_quiz: "DESAFIO DAS ABELHAS",
        game_sub_quiz: "Teste seus conhecimentos!",
        game_swipe_hint: "Deslize a carta para o lado e descubra curiosidades",
        game_restart: "RECOMEÇAR",
        game_question: "Pergunta",
        game_curiosity: "Curiosidade",
        game_congrats: "Parabéns!",
        game_quiz_done: "Você completou o quiz.",
        game_score: "Acertos",
        game_cards_done: "Você completou todas as cartas.",
        game_title_cur: "CURIOSIDADES MHNJB",
        game_sub_cur: "Deslize e descubra",
        exit_q: "Deseja sair da navegação na trilha?",
        exit_cont: "Continuar",
        exit_leave: "Sair",
        trail_congrats: "PARABÉNS!",
        trail_completed: "Você completou a trilha.",
        trail_enjoy: "Desfrute outros espaços do museu MHNJB.",
        trail_exit_btn: "SAIR",
        rotate_title: "Fica melhor em pé! 🐝",
        rotate_desc: "Para caminhar pelo museu e curtir a experiência da trilha, use seu celular na vertical."
    },
    en: {
        slogan: "EXPLORE THE MHNJB WITH THE BEES!", 
        start_trail: "START TRAIL", 
        welcome_title: "Welcome to MHNJB!",
        available_trail: "Self-guided trail available:",
        btn_start_trail: "START",
        trail_name: "Pollination Trail",
        warn_dont_touch: "Native bees don't sting!<br>For their well-being, <strong>please just observe and do not touch the boxes</strong>.",
        close_btn: "CLOSE",
        follow_trail_to: "FOLLOW THE TRAIL TO",
        stations_visited: "stations visited",
        i_am_here: "I'M HERE",
        btn_exit: "EXIT",
        new_discovery: "New discovery!",
        trail_started: "TRAIL START", 
        go_to_gate: "GO TO GATE 1", 
        go_to_gate_expanded: "GO TO GATE 1 OF MHNJB",
        nav_go_to_meliponary: "GO TO THE MELIPONARY",
        nav_trail: "Trail", 
        nav_discover: "Challenge", 
        nav_collection: "Collection", 
        nav_mhnjb: "MHNJB", 
        nav_faq: "FAQ", 
        menu_sub: "Explore the MHNJB with the bees", 
        menu_info: "Information", 
        settings_title: "Settings", 
        set_sys: "SYSTEM", 
        set_eco: "Power Saving", 
        set_gps: "GPS & Location", 
        set_vib: "VIBRATION", 
        set_haptic: "Haptic Feedback", 
        set_pref: "PREFERENCES", 
        set_lang: "Language", 
        set_data: "MANAGE DATA", 
        set_reset_trail: "Delete Trail Progress", 
        set_reset_col: "Clear Unlocked Collection", 
        modal_sure: "Are you sure?", 
        modal_no: "No", 
        modal_yes: "Yes, delete", 
        set_offline_map: "Baixar Mapa Offline",
        set_offline_map_done: "Mapa Offline Baixado",
        set_delete: "DELETE",
        eco_title: "Power Saving", 
        eco_anim: "Reduce animations", 
        eco_desc: "Enabling this option reduces visual effects to save battery life.", 
        gps_title: "Location", 
        gps_allow: "Allow location access", 
        gps_prec: "Improve location accuracy", 
        gps_desc: "Improved accuracy uses nearby connections (like Wi-Fi and Bluetooth) to geographically reference your exact position in the museum.", 
        lang_name: "English", 
        desc_apagar: "You are about to delete your trail progress. This cannot be undone.", 
        desc_limpar: "You are about to clear your unlocked collection. This cannot be undone.", 
        faq_q1: "How do the stations work?", 
        faq_a1: "The trail is self-guided. As you pass each station, manually mark your visit on the map by clicking \"I'm here\" and follow the on-screen instructions. A new discovery awaits at every station.", 
        faq_q2: "Does the app work offline?", 
        faq_a2: "Yes! In the app settings, you can download the map for offline use. Real-time location becomes less accurate, and local temperature will be unavailable.",
        faq_q3: "How much is the ticket?", 
        faq_a3: "Spontaneous visit: free. Group visit: R$ 12.00 per visitor. Discounts for public institutions. Exempt: UFMG students/staff and over 60s.", 
        faq_q4: "Can the bees on the trail sting? Is it safe?",
        faq_a4: "It is completely safe! The app focuses on Brazilian stingless native species. They are harmless and do not sting. We just ask you not to touch the boxes.",
        faq_q5: "Is booking necessary?", 
        faq_a5: "Mandatory for groups over 10 people. Not required for individuals.", 
        faq_q6: "Why is booking mandatory?", 
        faq_a6: "To ensure safety, organization, and avoid overcapacity in indoor spaces.", 
        faq_q7: "What are the opening hours?", 
        faq_a7: "Wed to Sat: 8:30 am to 4:00 pm (stay until 5 pm). Closed on holidays.", 
        faq_q8: "How to get to MHNJB?", 
        faq_a8: "Address: Rua Gustavo da Silveira, 1035 - Santa Inês. Metro: Santa Inês Station. Buses: 4802A, 8001A, 9105, 9205, 9402.", 
        continue_trail: "CONTINUE ON TRAIL", 
        click_expand: "CLICK TO EXPAND", 
        menu_sec: "Safety Tips", 
        made_with: "Made with", 
        in_bh: "in Belo Horizonte - MG", 
        acc_title: "Accessibility", 
        acc_sub: "Make your experience more comfortable.", 
        acc_size: "TEXT SIZE", 
        acc_contrast: "CONTRAST", 
        acc_cont_def: "Default", 
        acc_cont_high: "High contrast", 
        acc_map: "MAP APPEARANCE", 
        acc_map_light: "Light", 
        acc_map_dark: "Dark", 
        acc_map_sys: "System", 
        acc_bold: "Bold text", 
        acc_motion: "Reduce motion", 
        layer_title: "View on map", 
        layer_sub: "Find and explore locations on the map.", 
        cat_expo: "Exhibitions", 
        cat_bees: "Bees", 
        cat_trees: "Notable Trees", 
        cat_gardens: "Special Gardens", 
        cat_leisure: "Leisure", 
        cat_canteen: "Canteen", 
        cat_water: "Water Fountains", 
        cat_restroom: "Restrooms", 
        cat_gate: "Gates", 
        info_help: "HELP", 
        info_how_map: "How to use the App",
        tut_intro: "Beezita is your digital pocket guide. Here are the main features:",
        tut_trail_title: "Pollination Trail",
        tut_trail_desc: "Navigate the map following the dashed line. When you reach a point, click \"I'M HERE\" to unlock cards and challenges.",
        tut_map_title: "Free Exploration",
        tut_map_desc: "Use the binoculars button on the map to activate \"View on map\". It highlights exhibitions, notable trees, and nearby utilities.",
        tut_col_title: "Logbook",
        tut_col_desc: "Every discovery on the trail is saved in the 'Collection' tab. Review what you learned even when offline.",
        tut_muse_title: "The Museum (MHNJB)",
        tut_muse_desc: "In the MHNJB tab, you will find operating hours, tickets, and the history of the Botanical Garden.",
        sec_title: "Safety", 
        sec_group: "SAFETY TIPS", 
        sec_1: "Bring insect repellent", 
        sec_2: "Use sunscreen", 
        sec_3: "Do not touch the bee boxes", 
        sec_4: "Do not collect plants or items", 
        sec_5: "Keep quiet and be respectful", 
        sec_6: "Wear closed shoes and pants", 
        sec_7: "Seek help if necessary", 
        toast_far: "Oops, it seems you are far away. Use this option when at MHNJB.", 
        toast_gps_denied: "Allow location access in your browser to center the map.", 
        toast_trail_cleared: "Trail progress deleted.", 
        toast_col_cleared: "Collection successfully cleared.",
        mhnjb_tag: "MHNJB - SPACE OF KNOWLEDGE", 
        mhnjb_title: "Museu de História Natural e Jardim Botânico da UFMG", 
        mhnjb_func_title: "Hours", 
        mhnjb_func_text: "Wednesday to Saturday, 8:30 AM to 4:00 PM (stay until 5:00 PM). Closed on holidays.", 
        mhnjb_ent_title: "Admission", 
        mhnjb_ent_text: "Free spontaneous visit. Groups with more than 10 people require prior scheduling.", 
        mhnjb_site: "VISIT OFFICIAL WEBSITE", 
        mhnjb_hist_title: "HISTORY AND MISSION", 
        mhnjb_hist_p1: "Located in the city of Belo Horizonte/MG and founded in 1969, the Museu de História Natural e Jardim Botânico da UFMG has the mission to be a space for the meeting of knowledge, aiming to contribute to the construction of knowledge about cultural and environmental heritage through the valuation of its collections, educational actions, exhibitions, and research.", 
        mhnjb_hist_p2: "It is open to the public, where visitors can find exhibitions in the areas of Archaeology, Botany, Historical Cartography, Bibliographic and Archival Documentation, the Pipiripau Nativity Scene, forest trails, local fauna and flora, and much more.", 
        poi_visited: "Visited", 
        poi_mark_visited: "Mark as visited", 
        poi_see_more: "See more", 
        poi_bee_house: "Bee house", 
        poi_bee_hotel: "Solitary bee hotel", 
        poi_meliponary: "Meliponário",
        col_tab_all: "All",
        col_tab_bees: "Bees",
        col_tab_expo: "Exhibitions",
        col_tab_others: "Others",
        col_logbook: "MY LOGBOOK",
        col_discovered: "discovered",
        col_of: "of",
        game_tab_quiz: "Quiz: Bees",
        game_tab_cur: "MHNJB Curiosities",
        game_cards: "cards",
        game_title_quiz: "BEE QUIZ",
        game_sub_quiz: "Test your knowledge!",
        game_swipe_hint: "Swipe the card sideways to discover curiosities",
        game_restart: "RESTART",
        game_question: "Question",
        game_curiosity: "Curiosity",
        game_congrats: "Congratulations!",
        game_quiz_done: "You have completed the quiz.",
        game_score: "Score",
        game_cards_done: "You have completed all cards.",
        game_title_cur: "MHNJB CURIOSITIES",
        game_sub_cur: "Swipe and discover",
        exit_q: "Do you want to exit trail navigation?",
        exit_cont: "Continue",
        exit_leave: "Exit",
        trail_congrats: "CONGRATULATIONS!",
        trail_completed: "You completed the trail.",
        trail_enjoy: "Enjoy other areas of the MHNJB museum.",
        trail_exit_btn: "EXIT",
        rotate_title: "It looks better in portrait! 🐝",
        rotate_desc: "To explore the museum and follow the trail comfortably, please hold your phone vertically."
    },
    es: {
        slogan: "¡EXPLORA EL MHNJB CON LAS ABEJAS!", 
        start_trail: "COMENZAR SENDERO", 
        welcome_title: "¡Bienvenido/a al MHNJB!",
        available_trail: "Sendero autoguiado disponible:",
        btn_start_trail: "COMENZAR",
        trail_name: "Sendero de la Polinización",
        warn_dont_touch: "¡Las abejas nativas no pican!<br>Para su bienestar, <strong>solo observa y no toques las cajas</strong>.",
        close_btn: "CERRAR",
        follow_trail_to: "SIGUE EL SENDERO HASTA",
        stations_visited: "estaciones visitadas",
        i_am_here: "ESTOY AQUÍ",
        btn_exit: "SALIR",
        new_discovery: "¡Nuevo descubrimiento!",
        trail_started: "INICIO DEL SENDERO", 
        go_to_gate: "VE A LA ENTRADA 1", 
        go_to_gate_expanded: "VE A LA ENTRADA 1 DEL MHNJB",
        nav_go_to_meliponary: "VE AL MELIPONARIO",
        nav_trail: "Ruta", 
        nav_discover: "Desafío", 
        nav_collection: "Colección", 
        nav_mhnjb: "MHNJB", 
        nav_faq: "FAQ", 
        menu_sub: "Explora el MHNJB con las abejas", 
        menu_info: "Información", 
        settings_title: "Ajustes", 
        set_sys: "SISTEMA", 
        set_eco: "Modo Ahorro", 
        set_gps: "GPS y Ubicación", 
        set_vib: "VIBRACIÓN", 
        set_haptic: "Respuesta táctil", 
        set_pref: "PREFERENCIAS", 
        set_lang: "Idioma", 
        set_data: "GESTIONAR DATOS", 
        set_reset_trail: "Borrar Progreso del Sendero", 
        set_reset_col: "Limpiar Colección Desbloqueada", 
        modal_sure: "¿Estás seguro?", 
        modal_no: "No", 
        modal_yes: "Sí, borrar", 
        set_offline_map: "Descargar Mapa Offline",
        set_offline_map_done: "Mapa Offline Descargado",
        set_delete: "ELIMINAR",
        eco_title: "Modo Ahorro", 
        eco_anim: "Reducir animaciones", 
        eco_desc: "Activar esta opción reduce los efectos visuales para ahorrar batería.", 
        gps_title: "Ubicación", 
        gps_allow: "Permitir acceso a ubicación", 
        gps_prec: "Mejorar precisión de ubicación", 
        gps_desc: "La precisión mejorada utiliza conexiones cercanas (como Wi-Fi e Bluetooth) para referenciar geográficamente tu posición exacta en el museo.", 
        lang_name: "Español", 
        desc_apagar: "Estás a punto de borrar el progreso del sendero. Esto no se puede deshacer.", 
        desc_limpar: "Estás a punto de limpiar la colección desbloqueada. Esto no se puede deshacer.", 
        faq_q1: "¿Cómo funcionan las estaciones?", 
        faq_a1: "El sendero es autoguiado. Al pasar por cada estación, marca manualmente tu visita en el mapa haciendo clic en \"Estoy aquí\" y sigue las instrucciones en la pantalla. En cada estación, un nuevo descubrimiento.", 
        faq_q2: "¿La aplicación funciona sin internet?", 
        faq_a2: "¡Sí! En la configuración de la aplicación es posible descargar el mapa para usarlo sin conexión. La ubicación en tiempo real se vuelve menos precisa y la temperatura local no estará disponible.",
        faq_q3: "¿Cuánto cuesta la entrada?", 
        faq_a3: "Visita espontánea: gratis. Grupos: R$ 12,00 por visitante. Descuentos para instituciones públicas. Exentos: estudiantes/personal UFMG y mayores de 60 años.", 
        faq_q4: "¿Las abejas del sendero pueden picar? ¿Es seguro?",
        faq_a4: "¡Es totalmente seguro! La aplicación se centra en las especies nativas brasileñas sin aguijón. Son inofensivas y no pican. Solo pedimos no tocar las cajas.",
        faq_q5: "¿Es necesario reservar?", 
        faq_a5: "Obligatorio para grupos de más de 10 personas. No es necesario para individuos.", 
        faq_q6: "¿Por qué es obligatorio reservar?", 
        faq_a6: "Para garantizar la seguridad, organización y evitar el exceso de capacidad en espacios cerrados.", 
        faq_q7: "¿Cuál es el horario de atención?", 
        faq_a7: "Mié a Sáb: 8:30 a 16:00 (permanencia hasta las 17:00). Cerrado los festivos.", 
        faq_q8: "¿Como chegar al MHNJB?", 
        faq_a8: "Dirección: Rua Gustavo da Silveira, 1035 - Santa Inês. Metro: Estación Santa Inês. Autobuses: 4802A, 8001A, 9105, 9205, 9402.", 
        continue_trail: "CONTINÚE EL SENDERO", 
        click_expand: "CLIC PARA EXPANDIR", 
        menu_sec: "Consejos de Seguridad", 
        made_with: "Hecho con", 
        in_bh: "en Belo Horizonte - MG", 
        acc_title: "Accesibilidad", 
        acc_sub: "Haz tu experiencia más cómoda.", 
        acc_size: "TAMAÑO DEL TEXTO", 
        acc_contrast: "CONTRASTE", 
        acc_cont_def: "Predeterminado", 
        acc_cont_high: "Alto contraste", 
        acc_map: "APARIENCIA DEL MAPA", 
        acc_map_light: "Claro", 
        acc_map_dark: "Oscuro", 
        acc_map_sys: "Sistema", 
        acc_bold: "Texto en negrita", 
        acc_motion: "Reducir movimiento", 
        layer_title: "Ver en el mapa", 
        layer_sub: "Encuentra y explora lugares en el mapa.", 
        cat_expo: "Exposiciones", 
        cat_bees: "Abejas", 
        cat_trees: "Árboles Notables", 
        cat_gardens: "Jardines Especiales", 
        cat_leisure: "Ocio", 
        cat_canteen: "Cantina", 
        cat_water: "Bebederos", 
        cat_restroom: "Baños", 
        cat_gate: "Portones", 
        info_help: "AYUDA", 
        info_how_map: "Cómo usar la App",
        tut_intro: "Beezita es tu guía digital de bolsillo. Mira las funciones principales:",
        tut_trail_title: "Sendero de la Polinización",
        tut_trail_desc: "Navega por el mapa siguiendo la línea discontinua. Al llegar a un punto, haz clic en \"ESTOY AQUÍ\" para desbloquear cartas y desafíos.",
        tut_map_title: "Exploración Libre",
        tut_map_desc: "Usa el botón de prismáticos en el mapa para activar el \"Ver en el mapa\". Destaca exposiciones, árboles notables y utilidades cercanas.",
        tut_col_title: "Diario de a Bordo",
        tut_col_desc: "Cada descubrimiento en el sendero se guarda en la pestaña 'Colección'. Revisa lo que aprendiste incluso sin conexión.",
        tut_muse_title: "El Museo (MHNJB)",
        tut_muse_desc: "En la pestaña MHNJB, encontrarás horarios, entradas y la historia del Jardín Botánico.",
        sec_title: "Seguridad", 
        sec_group: "CONSEJOS DE SEGURANIDAD", 
        sec_1: "Lleva repelente de insectos", 
        sec_2: "Usa protector solar", 
        sec_3: "No toques las cajas de abejas", 
        sec_4: "No recolectes plantas ni objetos", 
        sec_5: "Guarda silencio y respeta", 
        sec_6: "Usa zapatos cerrados y pantalones", 
        sec_7: "Busca ayuda si es necesario", 
        toast_far: "Ups, parece que estás lejos. Usa esta opción cuando estés en el MHNJB.", 
        toast_gps_denied: "Permite la ubicación en el navegador para centrar el mapa.", 
        toast_trail_cleared: "Progreso del sendero borrado.", 
        toast_col_cleared: "Colección limpiada con éxito.",
        mhnjb_tag: "MHNJB - ESPACIO DE SABERES", 
        mhnjb_title: "Museu de História Natural e Jardim Botânico da UFMG", 
        mhnjb_func_title: "Horario", 
        mhnjb_func_text: "Miércoles a sábado, de 8:30 a 16:00 (permanencia hasta las 17:00). Cerrado los festivos.", 
        mhnjb_ent_title: "Entrada", 
        mhnjb_ent_text: "Visita espontánea gratuita. Grupos con más de 10 personas requieren reserva previa.", 
        mhnjb_site: "VISITAR SITIO WEB OFICIAL", 
        mhnjb_hist_title: "HISTORIA Y MISIÓN", 
        mhnjb_hist_p1: "Ubicado en la ciudad de Belo Horizonte/MG y fundado en 1969, el Museu de História Natural e Jardim Botânico da UFMG tiene la misión de ser un espacio de encuentro de saberes, con el objetivo de contribuir a la construcción de conocimientos sobre el patrimonio cultural y ambiental mediante la valorización de sus colecciones, acciones educativas, exposiciones y encuestas.", 
        mhnjb_hist_p2: "Está abierto al público, donde los visitantes pueden encontrar exposiciones en las áreas de Arqueología, Botánica, Cartografía Histórica, Documentación Bibliográfica y Archivística, el Pesebre de Pipiripau, senderos en el bosque, fauna y flora local, y mucho más.", 
        poi_visited: "Visitado", 
        poi_mark_visited: "Marcar como visitado", 
        poi_see_more: "Ver más", 
        poi_bee_house: "Casa de abeja", 
        poi_bee_hotel: "Hotel para abejas solitarias", 
        poi_meliponary: "Meliponário",
        col_tab_all: "Todos",
        col_tab_bees: "Abejas",
        col_tab_expo: "Exposiciones",
        col_tab_others: "Otros",
        col_logbook: "MI DIARIO DE A BORDO",
        col_discovered: "descubiertos",
        col_of: "de",
        game_tab_quiz: "Quiz: Abejas",
        game_tab_cur: "Curiosidades MHNJB",
        game_cards: "cartas",
        game_title_quiz: "DESAFÍO DE ABEJAS",
        game_sub_quiz: "¡Prueba tus conocimientos!",
        game_swipe_hint: "Desliza la carta hacia un lado y descubre curiosidades",
        game_restart: "REINICIAR",
        game_question: "Pregunta",
        game_curiosity: "Curiosidad",
        game_congrats: "¡Felicidades!",
        game_quiz_done: "Has completado el quiz.",
        game_score: "Aciertos",
        game_cards_done: "Has completado todas las cartas.",
        game_title_cur: "CURIOSIDADES MHNJB",
        game_sub_cur: "Desliza y descubre",
        exit_q: "¿Deseas salir de la navegación del sendero?",
        exit_cont: "Continuar",
        exit_leave: "Salir",
        trail_congrats: "¡FELICIDADES!",
        trail_completed: "Completaste el sendero.",
        trail_enjoy: "Disfruta de otros espacios del museo MHNJB.",
        trail_exit_btn: "SALIR",
        rotate_title: "¡Se ve mejor en vertical! 🐝",
        rotate_desc: "Para recorrer el museo y seguir el sendero cómodamente, por favor sostén tu teléfono en posición vertical."
    }
};

function aplicarIdioma(idioma) {
    if (!dicionario[idioma]) return;
    localStorage.setItem('beezita_lang', idioma);
    const textos = dicionario[idioma];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const chave = el.getAttribute('data-i18n');
        if (textos[chave]) {
            if (el.querySelector('i')) {
                const icone = el.querySelector('i').outerHTML;
                el.innerHTML = icone + " " + textos[chave];
            } else {
                el.innerHTML = textos[chave]; // innerHTML renderiza o código evitando problemas com acentos e tags HTML aparecendo como texto para o usuário.
            }
        }
    });

    const labelIdiomaAtual = document.getElementById('label-idioma-atual');
    if (labelIdiomaAtual) labelIdiomaAtual.innerText = textos.lang_name;

    if (typeof renderizarCartas === 'function') {
        renderizarCartas();
    }
}

document.querySelectorAll('.btn-select-lang').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        aplicarIdioma(lang);
        btn.closest('.sub-settings-panel').classList.remove('active');
    });
});

const idiomaSalvo = localStorage.getItem('beezita_lang') || 'pt';
setTimeout(() => aplicarIdioma(idiomaSalvo), 100);

// --- LÓGICA DO PAINEL DE CONFIGURAÇÕES, SUB-PÁGINAS E POP-UP MODAL ---
const configBtnMenu = document.querySelector('.config-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings-btn');
let isSettingsOpen = false;

function toggleSettingsPanel() {
    if (isMenuOpen) toggleMenu(); 
    isSettingsOpen = !isSettingsOpen;
    document.body.classList.toggle('settings-open', isSettingsOpen);
}

if (configBtnMenu) configBtnMenu.addEventListener('click', (e) => { e.preventDefault(); toggleSettingsPanel(); });
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettingsPanel);

const navToSubBtns = document.querySelectorAll('.nav-to-sub');
const backSettingsBtns = document.querySelectorAll('.back-settings-btn');

navToSubBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId)?.classList.add('active');
    });
});

backSettingsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.sub-settings-panel').classList.remove('active');
    });
});

// --- SISTEMA DE DADOS: GERENCIAR PROGRESSO E COLEÇÃO ---
const modalOverlay = document.getElementById('confirm-modal-overlay');
const modalDesc = document.getElementById('modal-desc');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
const openModalBtns = document.querySelectorAll('.open-modal-btn');

// Ao clicar para abrir o modal, guardamos qual botão chamou ele
openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        const acao = btn.getAttribute('data-action'); 
        
        modalDesc.innerText = acao === 'apagar' ? dicionario[lang].desc_apagar : dicionario[lang].desc_limpar;
        modalConfirm.setAttribute('data-current-action', acao); // Salva a ação no botão "Sim"
        
        modalOverlay.classList.add('active');
    });
});

modalCancel?.addEventListener('click', () => modalOverlay.classList.remove('active'));

// O clique de CONFIRMAÇÃO que faz a mágica real
modalConfirm?.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    const acao = modalConfirm.getAttribute('data-current-action');
    
    if (acao === 'apagar') {
        // 1. APAGAR PROGRESSO DA TRILHA: Lê o roteiro e desmarca apenas eles
        roteiroTrilha.forEach(nome => {
            const safeName = nome.replace(/\s+/g, '-').toLowerCase();
            localStorage.removeItem(`poi_visited_${safeName}`); // Tira da memória
            
            // Reseta as colmeias no mapa para a cor marrom
            if (marcadoresNoMapa[nome]) {
                marcadoresNoMapa[nome].setIcon(criarIconeGeografico(nome, 'pending'));
            }
        });
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        mostrarToastAviso(dicionario[lang].toast_trail_cleared);
        resetarTrilha(); // Devolve a UI da trilha ao estado inicial

    } else if (acao === 'limpar') {
        // 2. LIMPAR COLEÇÃO DESBLOQUEADA: Bomba atômica inteligente
        const chavesMemoria = Object.keys(localStorage);
        
        chavesMemoria.forEach(chave => {
            // Apaga APENAS as coisas visitadas (Não apaga idioma ou acessibilidade)
            if (chave.startsWith('poi_visited_')) {
                localStorage.removeItem(chave);
            }
        });
        
        // Reseta todos os ícones da trilha visualmente no mapa
        Object.keys(marcadoresNoMapa).forEach(nome => {
            const isBeeStation = nome.includes("Casa") || nome.includes("Hotel") || nome.includes("Meliponário");
            if (isBeeStation && marcadoresNoMapa[nome]) {
                marcadoresNoMapa[nome].setIcon(criarIconeGeografico(nome, 'pending'));
            }
        });
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        mostrarToastAviso(dicionario[lang].toast_col_cleared);
        resetarTrilha();
    }
    
    // Atualiza a tela de Coleção na hora (desliga as figurinhas)
    if (typeof renderizarColecao === 'function') {
        renderizarColecao();
    }
    
    // Feedback tátil forte para reforçar que algo foi deletado
    if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
    }
    
    // Fecha o painel de configurações para o usuário ver o resultado
    const subPanel = modalConfirm.closest('.sub-settings-panel');
    if (subPanel) subPanel.classList.remove('active');
});

// --- LÓGICA ESPELHADA: REDUZIR ANIMAÇÕES ---
const switchAccessMotion = document.getElementById('switch-access-motion');
const switchEcoMotion = document.getElementById('switch-eco-motion');

function aplicarCorteAnimacoes(ativado) {
    document.body.classList.toggle('access-reduce-motion', ativado);
    localStorage.setItem('beezita_reduce_motion', ativado ? 'true' : 'false');
    if (switchAccessMotion) switchAccessMotion.checked = ativado;
    if (switchEcoMotion) switchEcoMotion.checked = ativado;
}

if (switchAccessMotion) switchAccessMotion.addEventListener('change', (e) => aplicarCorteAnimacoes(e.target.checked));
if (switchEcoMotion) switchEcoMotion.addEventListener('change', (e) => aplicarCorteAnimacoes(e.target.checked));

const semAnimacoesSalvo = localStorage.getItem('beezita_reduce_motion') === 'true';
aplicarCorteAnimacoes(semAnimacoesSalvo);

// --- LÓGICA ESPELHADA: FEEDBACK TÁTIL ---
const switchAccessHaptic = document.getElementById('switch-access-haptic');
const switchSettingsHaptic = document.getElementById('switch-settings-haptic');
let isHapticEnabled = true; // A vibração começa ativada por padrão

function aplicarFeedbackTatil(ativado) {
    isHapticEnabled = ativado;
    localStorage.setItem('beezita_haptic', ativado ? 'true' : 'false');
    if (switchAccessHaptic) switchAccessHaptic.checked = ativado;
    if (switchSettingsHaptic) switchSettingsHaptic.checked = ativado;
}

if (switchAccessHaptic) switchAccessHaptic.addEventListener('change', (e) => aplicarFeedbackTatil(e.target.checked));
if (switchSettingsHaptic) switchSettingsHaptic.addEventListener('change', (e) => aplicarFeedbackTatil(e.target.checked));

const hapticSalvo = localStorage.getItem('beezita_haptic');
if (hapticSalvo !== null) aplicarFeedbackTatil(hapticSalvo === 'true');

// --- ACORDEÃO: HISTÓRIA E MISSÃO ---
const historiaBtn = document.getElementById('historia-missao-btn');
if (historiaBtn) {
    historiaBtn.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('expanded');
    });

    document.addEventListener('click', function(e) {
        if (historiaBtn.classList.contains('expanded') && !e.target.closest('#historia-missao-btn')) {
            historiaBtn.classList.remove('expanded');
        }
    });
}

// =======================================================================
// --- LÓGICA DA TRILHA GAMIFICADA E MAPA GEORREFERENCIADO ---
// =======================================================================

const roteiroTrilha = [
    "Portaria 1",
    "Casa de abelha 1",
    "Casa de abelha 2",
    "Jequitibá",
    "Casa de abelha 3",
    "Sapucaia 1", // Nome idêntico ao que está no GeoJSON
    "Sapucaia 2", // Nome idêntico ao que está no GeoJSON
    "Casa de abelha 4",
    "Casa de abelha 5",
    "Casa de abelha 6",
    "Hotel para abelhas solitárias",
    "Casa de abelha 7",
    "Meliponário"
];

let passoTrilhaAtual = 0;
let marcadoresNoMapa = {}; 
let isTrailStarted = false; 

// =======================================================================
// --- BANCO DE DADOS DINÂMICO DAS RECOMPENSAS (TRILÍNGUE) ---
// =======================================================================
const recompensasDados = {
    "Casa de abelha 1": {
        pt: { titulo: `Mirim <span class="scientific-name">(Plebeia droryana)</span>`, descricao: `Pequena no tamanho, gigante na importância. A Mirim é uma abelha nativa sem ferrão que ajuda a polinizar muitas das plantas do museu. Sua entrada costuma ter um detalhe curioso: às vezes aparecem dois furinhos, um maior e outro menor, funcionando como a porta de uma cidade em miniatura.`, curiosidade: `<strong>Curiosidade:</strong> O cheiro da entrada ajuda as abelhas a encontrarem sua casa. As abelhas dessa trilha são conhecidas como <strong style='color: #95d89a;'>sem ferrão</strong>.` },
        en: { titulo: `Mirim <span class="scientific-name">(Plebeia droryana)</span>`, descricao: `Small in size, giant in importance. The Mirim is a native stingless bee that helps pollinate many of the museum's plants. Its entrance usually has a curious detail: sometimes two small holes appear, one larger and one smaller, functioning like the door to a miniature city.`, curiosidade: `<strong>Curiosity:</strong> The smell of the entrance helps the bees find their home. The bees on this trail are known as <strong style='color: #95d89a;'>stingless bees</strong>.` },
        es: { titulo: `Mirim <span class="scientific-name">(Plebeia droryana)</span>`, descricao: `Pequeña en tamaño, gigante en importancia. La Mirim es una abeja nativa sin aguijón que ayuda a polinizar muchas de las plantas del museo. Su entrada suele tener un detalle curioso: a veces aparecen dos pequeños agujeros, uno más grande y otro más pequeño, funcionando como la puerta de una ciudad en miniatura.`, curiosidade: `<strong>Curiosidad:</strong> El olor de la entrada ayuda a las abejas a encontrar su casa. Las abejas de este sendero se conocen como <strong style='color: #95d89a;'>abejas sin aguijón</strong>.` }
    },
    "Casa de abelha 2": {
        pt: { badge: `Cheiro de perigo no ar...`, titulo: `<span style="color: #ff6b6b; font-weight: 800;">Ataque</span> <span style="color: var(--warm-cream); font-weight: 500;">de</span> Abelha-limão <br><span class="scientific-name">(Lestrimelitta limao)</span>`, descricao: `Nem toda abelha vive em paz com as vizinhas. A Abelha-limão pode invadir colônias de outras espécies para roubar recursos e ocupar ninhos. Faz parte das relações naturais entre os seres vivos e mostra como os ecossistemas possuem seus próprios mecanismos de equilíbrio. Após um ataque, esta casa ficou <strong style='color: var(--honey-yellow);'>vazia!</strong>`, curiosidade: `<strong>Curiosidade:</strong> Algumas espécies desenvolveram estratégias especiais para sobreviver a esses ataques.` },
        en: { badge: `Smell of danger in the air...`, titulo: `<span style="color: #ff6b6b; font-weight: 800;">Attack</span> <span style="color: var(--warm-cream); font-weight: 500;">by</span> Abelha-limão <br><span class="scientific-name">(Lestrimelitta limao)</span>`, descricao: `Not all bees live in peace with their neighbors. The Abelha-limão can invade colonies of other species to steal resources and occupy nests. It is part of the natural relationships between living beings and shows how ecosystems have their own balancing mechanisms. After an attack, this house became <strong style='color: var(--honey-yellow);'>empty!</strong>`, curiosidade: `<strong>Curiosity:</strong> Some species have developed special strategies to survive these attacks.` },
        es: { badge: `Olor a peligro en el aire...`, titulo: `<span style="color: #ff6b6b; font-weight: 800;">Ataque</span> <span style="color: var(--warm-cream); font-weight: 500;">de</span> Abelha-limão <br><span class="scientific-name">(Lestrimelitta limao)</span>`, descricao: `No todas las abejas viven en paz con sus vecinas. La Abelha-limão puede invadir colonias de otras especies para robar recursos y ocupar nidos. Es parte de las relaciones naturales entre los seres vivos y muestra cómo los ecosistemas tienen sus propios mecanismos de equilibrio. ¡Después de un ataque, esta casa quedó <strong style='color: var(--honey-yellow);'>vacía!</strong>`, curiosidade: `<strong>Curiosidad:</strong> Algunas especies han desarrollado estrategias especiales para sobrevivir a estos ataques.` }
    },
    "Casa de abelha 3": {
        pt: { titulo: `Iraí <span class="scientific-name">(Nannotrigona testaceicornis)</span>`, descricao: `Pequena, mas estratégica. Quando sofre ataques da abelha-limão, a Iraí costuma evitar o confronto direto. Em vez de lutar, muitas operárias se refugiam no interior da colônia e aguardam o perigo passar.`, curiosidade: `<strong>Curiosidade:</strong> Sobreviver nem sempre depende da força. Às vezes, depende da estratégia.` },
        en: { titulo: `Iraí <span class="scientific-name">(Nannotrigona testaceicornis)</span>`, descricao: `Small, but strategic. When attacked by the Abelha-limão, the Iraí usually avoids direct confrontation. Instead of fighting, many workers take refuge inside the colony and wait for the danger to pass.`, curiosidade: `<strong>Curiosity:</strong> Surviving doesn't always depend on strength. Sometimes, it depends on strategy.` },
        es: { titulo: `Iraí <span class="scientific-name">(Nannotrigona testaceicornis)</span>`, descricao: `Pequeña, pero estratégica. Cuando es atacada por la Abelha-limão, la Iraí suele evitar la confrontación directa. En lugar de luchar, muchas obreras se refugian dentro de la colonia y esperan a que pase el peligro.`, curiosidade: `<strong>Curiosidad:</strong> Sobrevivir no siempre depende de la fuerza. A veces, depende de la estrategia.` }
    },
    "Casa de abelha 4": {
        pt: { titulo: `Mandaçaia <span class="scientific-name">(Melipona quadrifasciata)</span>`, descricao: `A Mandaçaia é uma das abelhas sem ferrão mais conhecidas do Brasil. Ela coleta néctar e pólen das flores e mantém reservas de alimento para períodos com pouca floração.`, curiosidade: `<strong>Curiosidade:</strong> Sua entrada costuma ser construída com geoprópolis, uma mistura de resinas, cera e partículas de solo. O mel das abelhas sem ferrão é guardado em pequenos potes dentro do ninho, e não em favos como as abelhas do gênero Apis.` },
        en: { titulo: `Mandaçaia <span class="scientific-name">(Melipona quadrifasciata)</span>`, descricao: `The Mandaçaia is one of the most well-known stingless bees in Brazil. It collects nectar and pollen from flowers and keeps food reserves for periods with little flowering.`, curiosidade: `<strong>Curiosity:</strong> Its entrance is usually built with geopropolis, a mixture of resins, wax, and soil particles. The honey of stingless bees is kept in small pots inside the nest, and not in honeycombs like bees of the Apis genus.` },
        es: { titulo: `Mandaçaia <span class="scientific-name">(Melipona quadrifasciata)</span>`, descricao: `La Mandaçaia es una de las abejas sin aguijón más conocidas de Brasil. Recolecta néctar y polen de las flores y mantiene reservas de alimento para períodos de poca floración.`, curiosidade: `<strong>Curiosidad:</strong> Su entrada suele estar construida con geopropóleo, una mezcla de resinas, cera y partículas de tierra. La miel de las abejas sin aguijón se guarda en pequeñas macetas dentro del nido, y no en panales como las abejas del género Apis.` }
    },
    "Casa de abelha 5": {
        pt: { titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `Mais tranquila e fácil de observar, a Guaraipo costuma ser encontrada em ambientes mais úmidos. Na entrada do ninho, é comum que haja abelhas guardiãs controlando quem entra e quem sai da colônia. O nome “bicolor” vem das duas faixas claras presentes no abdômen, o que ajuda a identificar a espécie.`, curiosidade: `<strong>Curiosidade:</strong> Em algumas situações, essa espécie pode conviver com mais de uma rainha no mesmo ninho.` },
        en: { titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `More peaceful and easy to observe, the Guaraipo is usually found in more humid environments. At the nest entrance, it is common to have guard bees controlling who enters and leaves the colony. The name "bicolor" comes from the two light stripes on its abdomen, which helps identify the species.`, curiosidade: `<strong>Curiosity:</strong> In some situations, this species can live with more than one queen in the same nest.` },
        es: { titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `Más tranquila y fácil de observar, la Guaraipo suele encontrarse en ambientes más húmedos. En la entrada del nido, es común que haya abejas guardianas controlando quién entra y sale de la colonia. El nombre "bicolor" proviene de las dos franjas claras presentes en el abdomen, lo que ayuda a identificar la especie.`, curiosidade: `<strong>Curiosidad:</strong> En algunas situaciones, esta especie puede convivir con más de una reina en el mismo nido.` }
    },
    "Casa de abelha 6": {
        pt: { badge: `Ei, nós já nos vimos antes?`, titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `Sim, é outra colônia de Guaraipo! A Guaraipo é uma polinizadora essencial e uma grande aliada do nosso Jardim Botânico. Ao visitar as flores em busca de néctar e pólen, ela ajuda na polinização e na reprodução de muitas das plantas que você encontra ao redor.`, curiosidade: `<strong>Curiosidade:</strong> Assim como outras espécies do gênero Melipona, a Guaraipo transporta pólen nas "cestinhas" das patas traseiras, chamadas corbículas.` },
        en: { badge: `Hey, haven't we met before?`, titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `Yes, it's another Guaraipo colony! The Guaraipo is an essential pollinator and a great ally of our Botanical Garden. By visiting flowers in search of nectar and pollen, it helps in the pollination and reproduction of many of the plants you find around.`, curiosidade: `<strong>Curiosity:</strong> Like other species of the Melipona genus, the Guaraipo transports pollen in the "little baskets" of its hind legs, called corbiculae.` },
        es: { badge: `Oye, ¿nos hemos visto antes?`, titulo: `Guaraipo <span class="scientific-name">(Melipona bicolor)</span>`, descricao: `¡Sí, es otra colonia de Guaraipo! La Guaraipo es una polinizadora esencial y una gran aliada de nuestro Jardín Botánico. Al visitar las flores en busca de néctar y polen, ayuda en la polinización y reproducción de muchas de las plantas que encuentras alrededor.`, curiosidade: `<strong>Curiosidad:</strong> Al igual que otras especies del género Melipona, la Guaraipo transporta polen en las "cestitas" de sus patas traseras, llamadas corbículas.` }
    },
    "Hotel para abelhas solitárias": {
        pt: { titulo: `Hotel para Abelhas Solitárias`, descricao: `Nem todas as abelhas vivem em colônias. Muitas espécies passam toda a vida sozinhas. Algumas constroem seus ninhos escavando madeira ou o solo, enquanto outras aproveitam pequenos buracos já existentes. Este hotel oferece locais seguros para que elas construam seus ninhos e depositem seus ovos.`, curiosidade: `<strong>Curiosidade:</strong> Diferente das abelhas sociais, cada abelha solitária constrói seu ninho, coleta alimento e realiza todas as tarefas sozinha.` },
        en: { titulo: `Hotel for Solitary Bees`, descricao: `Not all bees live in colonies. Many species spend their entire lives alone. Some build their nests by excavating wood or soil, while others take advantage of existing small holes. This hotel offers safe places for them to build their nests and lay their eggs.`, curiosidade: `<strong>Curiosity:</strong> Unlike social bees, each solitary bee builds its nest, collects food, and performs all tasks alone.` },
        es: { titulo: `Hotel para Abejas Solitarias`, descricao: `No todas las abejas viven en colonias. Muchas especies pasan toda su vida solas. Algunas construyen sus nidos excavando madera o tierra, mientras que otras aprovechan pequeños agujeros ya existentes. Este hotel ofrece lugares seguros para que construyan sus nidos y depositen sus huevos.`, curiosidade: `<strong>Curiosidad:</strong> A diferencia de las abejas sociales, cada abeja solitaria construye su nido, recolecta alimento y realiza todas las tareas sola.` }
    },
    "Casa de abelha 7": {
        pt: { badge: `Resina protetora!`, titulo: `<span class="nome-especial-orquidea">Marmelada-amarela</span> <br><span class="scientific-name">(Frieseomelitta varia)</span>`, descricao: `Esta abelha constrói seus ninhos em ocos de árvores. Para proteger a colônia, as operárias revestem a entrada do ninho e a região ao redor com uma resina escura e pegajosa, que dificulta a ação de invasores.`, curiosidade: `<strong>Curiosidade:</strong> Se a colônia fica órfã, as operárias constroem células auxiliares com alimento extra. A larva que consome essa porção a mais se desenvolve em uma nova rainha.` },
        en: { badge: `Protective resin!`, titulo: `<span class="nome-especial-orquidea">Marmelada-amarela</span> <br><span class="scientific-name">(Frieseomelitta varia)</span>`, descricao: `This bee builds its nests in tree hollows. To protect the colony, the workers coat the nest entrance and the surrounding area with a dark, sticky resin that makes it difficult for invaders to act.`, curiosidade: `<strong>Curiosity:</strong> If the colony becomes orphaned, the workers build auxiliary cells with extra food. The larva that consumes this extra portion develops into a new queen.` },
        es: { badge: `¡Resina protectora!`, titulo: `<span class="nome-especial-orquidea">Marmelada-amarela</span> <br><span class="scientific-name">(Frieseomelitta varia)</span>`, descricao: `Esta abeja construye sus nidos en huecos de árboles. Para proteger la colonia, las obreras recubren la entrada del nido y la zona circundante con una resina oscura y pegajosa que dificulta la acción de los invasores.`, curiosidade: `<strong>Curiosidad:</strong> Si la colonia queda huérfana, las obreras construyen celdas auxiliares con alimento extra. La larva que consume esta porción adicional se desarrolla en una nueva reina.` }
    },
    "Meliponário": {
        pt: { badge: `Um bairro de abelhas`, titulo: `Meliponário`, descricao: `Você chegou ao meliponário! Aqui vivem diferentes espécies de abelhas sem ferrão que ajudam a conservar a biodiversidade e a restaurar áreas naturais por meio da polinização. Cada uma com suas regras, tarefas e formas de constituir suas colônias.`, curiosidade: `<strong>Curiosidade:</strong> Além das espécies encontradas na trilha, o meliponário também abriga a Mirim-luci <i>(Plebeia lucii)</i>, Bugia <i>(Melipona mondury)</i> e Mirim-preguiça <i>(Friesella schrottkyi)</i>.` },
        en: { badge: `A neighborhood of bees`, titulo: `Meliponary`, descricao: `You have arrived at the meliponary! Different species of stingless bees live here, helping to conserve biodiversity and restore natural areas through pollination. Each with its own rules, tasks, and ways of forming colonies.`, curiosidade: `<strong>Curiosity:</strong> Besides the species found on the trail, the meliponary also houses the Mirim-luci <i>(Plebeia lucii)</i>, Bugia <i>(Melipona mondury)</i>, and Mirim-preguiça <i>(Friesella schrottkyi)</i>.` },
        es: { badge: `Un barrio de abejas`, titulo: `Meliponario`, descricao: `¡Has llegado al meliponario! Aquí viven diferentes especies de abejas sin aguijón que ayudan a conservar la biodiversidad y restaurar áreas naturales a través de la polinización. Cada una con sus propias reglas, tareas y formas de constituir colonias.`, curiosidade: `<strong>Curiosidad:</strong> Además de las especies encontradas en el sendero, el meliponario también alberga la Mirim-luci <i>(Plebeia lucii)</i>, Bugia <i>(Melipona mondury)</i> y Mirim-preguiça <i>(Friesella schrottkyi)</i>.` }
    }
};
// Adicionar as outras "Casa de abelha X", "Hotel", etc, aqui depois seguindo o mesmo padrão!

// VARIÁVEIS DO MAPA
var mapaTrilha;
var marcadorUsuario;
var mapTileLayer;
var camadaTrilhasGeoJSON;

function criarIconeGeografico(nome, status) {
    const safeName = nome.replace(/\s+/g, '-').toLowerCase();
    
    // 1. Lógica para as Estações das Abelhas
    if (nome.includes("Casa") || nome.includes("Hotel") || nome.includes("Meliponário")) {
        let num = nome.replace(/[^0-9H-M]/g, ''); 
        let favoClass = status === 'visited' ? 'visited' : (status === 'active' ? 'active-target' : 'pending');
        let animClass = status === 'active' ? 'alvo-piscando' : '';
        
        const estacoesFixas = ["Casa de abelha 1", "Casa de abelha 2", "Casa de abelha 3", "Casa de abelha 4"];
        let visibilidadeEstacao = estacoesFixas.includes(nome) ? 'principal' : 'secundario';

        return L.divIcon({ 
            className: `estacao-mapa cat-abelha ${visibilidadeEstacao} ${animClass} marker-id-${safeName}`, 
            html: `<div class="marker ${favoClass}" role="button" tabindex="0" aria-label="${nome}" style="position:relative; transform:none; top:0; left:0;"><div class="honeycomb"><span>${num}</span></div></div>`, 
            iconSize: [40, 44], 
            iconAnchor: [20, 22] 
        });
    } 
    // 2. Lógica para os Pontos de Interesse (POI)
    else {
        let iconeBootstrap = 'bi-geo-alt-fill'; 
        let corFundo = 'var(--forest-green)';
        let tipoVisibilidade = 'secundario'; 
        let catClass = 'cat-lazer'; // Categoria padrão fallback
        
        const nomeLower = nome.toLowerCase();

        // CATEGORIA 1: PRINCIPAIS 
        if (
            nomeLower.includes("portaria") || nomeLower === "arqueologia" || 
            nomeLower.includes("paleontologia") || nomeLower.includes("pipiripau") ||
            nomeLower.includes("botânica") || nomeLower.includes("palacinho") ||
            nomeLower.includes("orquídea") || nomeLower.includes("biblioteca") 
        ) {
            tipoVisibilidade = 'principal'; 
            
            if (nomeLower.includes("portaria")) {
                iconeBootstrap = 'bi-geo-alt-fill'; corFundo = '#444'; catClass = 'cat-portaria';
            } else if (nomeLower.includes("biblioteca")) {
                iconeBootstrap = 'bi-book-half'; corFundo = '#D96B27'; catClass = 'cat-exposicao';
            } else {
                iconeBootstrap = 'bi-bank'; corFundo = '#D96B27'; catClass = 'cat-exposicao';
            }
        } 
        // CATEGORIA 2: SECUNDÁRIOS 
        else {
            if (nomeLower.includes("sanitários")) {
                iconeBootstrap = 'bi-badge-wc-fill'; corFundo = '#5C6B73'; catClass = 'cat-sanitario';
            } else if (nomeLower.includes("bebedouro")) {
                iconeBootstrap = 'bi-droplet-fill'; corFundo = '#4EA8DE'; catClass = 'cat-bebedouro';
            } else if (nomeLower.includes("cantina")) {
                iconeBootstrap = 'bi-cup-straw'; corFundo = '#A62626'; catClass = 'cat-cantina';
            } else if (
                nomeLower.includes("jardim de canga") || 
                nomeLower.includes("jardim sensorial") ||
                nomeLower.includes("jardim de plantas tóxicas") || 
                nomeLower.includes("jardim de plantas medicinais") ||
                nomeLower.includes("jardim jurássico")
            ) {
                iconeBootstrap = 'bi-leaf-fill'; corFundo = '#68785A'; catClass = 'cat-jardim';
            } else if (
                nomeLower.includes("jequitibá") || 
                nomeLower.includes("sapucaia") ||
                nomeLower.includes("clareira da caratinga") ||
                nomeLower.includes("sumaúma") || 
                nomeLower.includes("mogno") || 
                nomeLower.includes("barrigudas") || 
                nomeLower.includes("pau-brasil") || 
                nomeLower.includes("viveiro")
            ) {
                iconeBootstrap = 'bi-tree-fill'; corFundo = '#9C5838'; catClass = 'cat-arvore';
            } else if (
                nomeLower.includes("mirante da lagoa") || 
                nomeLower.includes("praça da canoa") || 
                nomeLower.includes("jogos educativos") ||
                nomeLower.includes("parquinho") || 
                nomeLower.includes("largo da barriguda") ||
                nomeLower.includes("anfiteatro da arqueologia") || 
                nomeLower.includes("anfiteatro da mata") ||
                nomeLower.includes("centro de visitantes")
            ) {
                iconeBootstrap = 'bi-flower3'; corFundo = '#DEA638'; catClass = 'cat-lazer';
            } else if (nomeLower.includes("dinossauro")) { // Novo
                iconeBootstrap = 'bi-camera-fill'; // Ícone turístico
                corFundo = '#DEA638'; // Amarelo Ouro
            }
        }

        let animClass = status === 'active' ? 'destaque-amarelo' : '';
        
        return L.divIcon({ 
            className: `ponto-extra-mapa ${tipoVisibilidade} ${catClass} ${animClass} marker-id-${safeName}`, 
            html: `
                <div role="button" tabindex="0" aria-label="${nome}" style="
                    width: 28px; height: 28px; 
                    background-color: ${corFundo}; 
                    border: 1.5px solid var(--warm-cream); 
                    border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                ">
                    <i class="bi ${iconeBootstrap}" aria-hidden="true" style="color: var(--warm-cream); font-size: 0.85rem;"></i>
                </div>
            `, 
            iconSize: [28, 28], 
            iconAnchor: [14, 14] 
        });
    }
}

function focarPontoTrilha(evitarMovimentoMapa = false) {
    const overlayAtivo = document.getElementById('discovery-overlay').classList.contains('active');
    if (overlayAtivo) return;

    const contadorElement = document.getElementById('contador-estacoes');
    if (contadorElement) {
        let estacoesVisitadas = 0;
        
        // 1. LÓGICA DO TEXTO (Mantém intacta, contando apenas as 8 recompensas)
        for (let i = 0; i < passoTrilhaAtual; i++) {
            let nomePonto = roteiroTrilha[i];
            if (nomePonto.includes("Casa de abelha") || nomePonto.includes("Hotel") || nomePonto.includes("Meliponário")) {
                estacoesVisitadas++;
            }
        }
        
        if (passoTrilhaAtual >= roteiroTrilha.length) estacoesVisitadas = 9; 
        contadorElement.innerText = estacoesVisitadas; 

        // 2. NOVA LÓGICA DA BARRA (Baseada nos 12 passos do roteiro)
        // Usa o total de passos (tamanho do roteiro - 1, pois começa no 0)
        let totalPassos = roteiroTrilha.length - 1; 
        let porcentagemBarra = (passoTrilhaAtual / totalPassos) * 100;
        
        // Trava de segurança para a barra não passar de 100%
        if (porcentagemBarra > 100) porcentagemBarra = 100;

        // Anima apenas a barra de progresso e avisa o leitor de tela
        const containerBarra = document.getElementById('acessibilidade-barra-trilha');
        const barraProgresso = document.querySelector('#home-progress-panel .progress-bar');
        
        if (barraProgresso) {
            barraProgresso.style.width = porcentagemBarra + '%';
            if (containerBarra) containerBarra.setAttribute('aria-valuenow', Math.round(porcentagemBarra));
        }
    }

    if(passoTrilhaAtual >= roteiroTrilha.length) {
        document.querySelector('.progress-subtitle').innerText = "PARABÉNS!";
        document.querySelector('.progress-action-text').innerText = "VOCÊ COMPLETOU A TRILHA";
        document.getElementById('btn-checkin')?.classList.remove('visible');
        return;
    }

    const nomeAlvo = roteiroTrilha[passoTrilhaAtual];
    
    roteiroTrilha.forEach((nome, index) => {
        const m = marcadoresNoMapa[nome];
        if(m) {
            if (index < passoTrilhaAtual) {
                m.setIcon(criarIconeGeografico(nome, 'visited'));
            } 
            // --- MUDANÇA AQUI: Adicionamos a condição && isTrailStarted ---
            else if (index === passoTrilhaAtual && isTrailStarted) { 
                m.setIcon(criarIconeGeografico(nome, 'active'));
            } 
            // ------------------------------------------------------------
            else {
                m.setIcon(criarIconeGeografico(nome, 'pending'));
            }
        }
    });

    const marcadorAlvo = marcadoresNoMapa[nomeAlvo];
    
    if(!marcadorAlvo) {
        passoTrilhaAtual++; 
        // --- MUDANÇA 1: Repassa o parâmetro se precisar tentar de novo ---
        setTimeout(() => focarPontoTrilha(evitarMovimentoMapa), 100);
        return;
    }

    // --- MUDANÇA 2: Só move o mapa se NÃO for para evitar o movimento ---
    if (!evitarMovimentoMapa) {
        mapaTrilha.flyTo(marcadorAlvo.getLatLng(), 19, { animate: true, duration: 1.5 });
    }

    trazerParaFrente(nomeAlvo);

    const subtitulo = document.querySelector('.progress-subtitle');
    const acaoText = document.querySelector('.progress-action-text');
    
    const pillMain = document.getElementById('pill-main-text');
    const lang = localStorage.getItem('beezita_lang') || 'pt';

    if (passoTrilhaAtual === 0) {
        if(subtitulo) {
             subtitulo.setAttribute('data-i18n', 'trail_started');
             subtitulo.innerText = dicionario[lang].trail_started;
        }
        if(acaoText) {
             acaoText.setAttribute('data-i18n', 'go_to_gate_expanded'); // Direcionado para o expandido
             acaoText.innerText = dicionario[lang].go_to_gate_expanded; 
        }
        
        // Mantém a pílula contraída com a instrução curta
        if (isTrailStarted && pillMain) {
            pillMain.removeAttribute('data-i18n');
            pillMain.innerText = dicionario[lang].go_to_gate.toUpperCase(); // Exibe "VÁ ATÉ A PORTARIA 1"
        }
    } else {
        if(subtitulo) {
            subtitulo.setAttribute('data-i18n', 'follow_trail_to');
            subtitulo.innerText = dicionario[lang].follow_trail_to;
        }
        
        let nomeExibicao = (nomeAlvo.includes("Sapucaia")) ? "Sapucaia" : nomeAlvo;
        
        if (nomeExibicao.startsWith("Casa de abelha")) {
            const num = nomeExibicao.replace(/\D/g, '');
            if(acaoText) acaoText.innerHTML = `<span data-i18n="poi_bee_house">${dicionario[lang].poi_bee_house}</span> ${num}`;
        } else if (nomeExibicao === "Hotel para abelhas solitárias") {
            if(acaoText) acaoText.innerHTML = `<span data-i18n="poi_bee_hotel">${dicionario[lang].poi_bee_hotel}</span>`;
        } else if (nomeExibicao === "Meliponário") {
            if(acaoText) acaoText.innerHTML = `<span data-i18n="poi_meliponary">${dicionario[lang].poi_meliponary}</span>`;
        } else {
            if(acaoText) {
                 acaoText.removeAttribute('data-i18n');
                 acaoText.innerText = nomeExibicao.toUpperCase();
            }
        }

        // Controle inteligente da pílula para os demais passos TRADUZIDO
        if (isTrailStarted && pillMain) {
            if (passoTrilhaAtual === roteiroTrilha.length - 1) {
                // Último passo: Meliponário - Fixo, curto e sem estourar o layout
                pillMain.setAttribute('data-i18n', 'nav_go_to_meliponary');
                pillMain.innerText = dicionario[lang].nav_go_to_meliponary || "VÁ ATÉ O MELIPONÁRIO";
            } else {
                // Passos intermediários
                pillMain.setAttribute('data-i18n', 'continue_trail');
                pillMain.innerText = dicionario[lang].continue_trail || "CONTINUE PELA TRILHA";
            }
        }
    }
    if (isTrailStarted) {
        const bPrev = document.getElementById('btn-prev-point');
        const bNext = document.getElementById('btn-next-point');
        
        if (bPrev) {
            const isFirst = (passoTrilhaAtual === 0);
            bPrev.classList.toggle('nav-disabled', isFirst);
            bPrev.disabled = isFirst; // Trava real
            bPrev.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
        }
        
        if (bNext) {
            if (passoTrilhaAtual >= roteiroTrilha.length - 1) {
                bNext.classList.add('is-final', 'nav-disabled');
                bNext.disabled = true; // Trava real
                bNext.setAttribute('aria-disabled', 'true');
                bNext.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i>';
            } else {
                bNext.classList.remove('is-final', 'nav-disabled');
                bNext.disabled = false; // Destrava real
                bNext.setAttribute('aria-disabled', 'false');
                bNext.innerHTML = '<i class="bi bi-chevron-right" aria-hidden="true"></i>';
            }
        }
    }
}

const homeProgressPanel = document.getElementById('home-progress-panel');
const btnCheckin = document.getElementById('btn-checkin');

const btnPrevPoint = document.getElementById('btn-prev-point');
const btnNextPoint = document.getElementById('btn-next-point');

// --- BOTÃO VOLTAR (SETA ESQUERDA) ---
if (btnPrevPoint) {
    btnPrevPoint.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(30);
        
        // Verifica se a tela de recompensa está aberta neste momento
        const overlayAtivo = document.getElementById('discovery-overlay').classList.contains('active');
        if (overlayAtivo) {
            alternarModoUI('normal'); // Fecha a recompensa e devolve ao mapa
            return; // Interrompe a função aqui para não retroceder a trilha sem querer
        }

        // Se a tela de recompensa NÃO estiver aberta, faz a navegação normal voltando um passo no mapa
        if (passoTrilhaAtual > 0) {
            passoTrilhaAtual--;
            focarPontoTrilha();
        }
    });
}

// --- BOTÃO CONTINUAR/AVANÇAR (SETA DIREITA) ---
if (btnNextPoint) {
    btnNextPoint.onclick = (e) => {
        e.stopPropagation();

        // 1. MODO AVULSO ("Ver mais" - Apenas fecha)
        if (btnNextPoint.classList.contains('btn-fechar-avulso')) {
            if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(20);
            
            document.body.classList.remove('recompensa-ativa');
            document.getElementById('discovery-overlay').classList.remove('active');
            
            // TRANSFORMAÇÃO INSTANTÂNEA: Sem atrasos, para sincronizar com a tela sumindo
            btnNextPoint.classList.remove('btn-fechar-avulso');
            btnNextPoint.innerHTML = '<i class="bi bi-chevron-right"></i>';
            
            const btnPrev = document.getElementById('btn-prev-point');
            if (btnPrev && isTrailStarted) btnPrev.style.display = 'flex';
            
            if (isTrailStarted && passoTrilhaAtual < roteiroTrilha.length) {
                document.getElementById('btn-checkin').classList.add('visible');
            }
            
            return; 
        }

        // 2. MODO CONTINUAR (Avança o Game)
        if (btnNextPoint.classList.contains('btn-continuar-mode')) {
            const ehUltimoPasso = (passoTrilhaAtual === roteiroTrilha.length - 1);

            if (ehUltimoPasso) {
                iniciarConclusao();
            } else {
                alternarModoUI('normal'); 
                setTimeout(() => {
                    if (passoTrilhaAtual < roteiroTrilha.length) {
                        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(30);
                        passoTrilhaAtual++; 
                        focarPontoTrilha(); 
                    }
                }, 50); 
            }
            return;
        }

        // 3. MODO FINALIZAR TRILHA
        if (btnNextPoint.classList.contains('is-final')) {
            const homeProgressPanel = document.getElementById('home-progress-panel');
            if (homeProgressPanel) homeProgressPanel.classList.add('contracted');
            document.querySelector('.trail-nav-group')?.classList.remove('expanded-mode');
            document.getElementById('btn-checkin')?.classList.remove('visible');
            return;
        }

        // 4. MODO NAVEGAÇÃO DE MAPA PADRÃO
        if (passoTrilhaAtual < roteiroTrilha.length - 1) {
            if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(30);
            passoTrilhaAtual++;
            focarPontoTrilha();
        }
    };
}

if (homeProgressPanel) {
    homeProgressPanel.addEventListener('click', function(e) {
        e.stopPropagation(); 
        if (this.classList.contains('contracted')) {
            this.classList.remove('contracted');
            
            const trailNavGroup = document.querySelector('.trail-nav-group');
            if (trailNavGroup) trailNavGroup.classList.add('expanded-mode');
            
            if (!isTrailStarted) {
                // TELA DE RECEPÇÃO PARA "COMEÇAR TRILHA"
                const progressInfo = document.querySelector('.progress-info');
                const bPrev = document.getElementById('btn-prev-point');
                const bNext = document.getElementById('btn-next-point');
                const bExit = document.getElementById('btn-exit-trail');
                
                if (bPrev) bPrev.style.display = 'none';
                if (bNext) bNext.style.display = 'none';
                if (bExit) bExit.style.display = 'none'; 
                
                // MÁGICA AQUI: Declaramos o idioma ANTES de construir o HTML
                const lang = localStorage.getItem('beezita_lang') || 'pt';
                
                if (progressInfo) {
                    progressInfo.style.setProperty('padding-right', '0px', 'important');
                    progressInfo.style.setProperty('margin-top', '0px', 'important');
                    
                    progressInfo.innerHTML = `
                        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; width: 100%; height: 100%; min-height: 85px;">
                            <h2 style="color: var(--honey-yellow); font-size: 1.05rem; margin-bottom: 2px; font-weight: 700;" data-i18n="welcome_title">${dicionario[lang].welcome_title}</h2>
                            <p style="color: var(--warm-cream); font-size: 0.75rem; margin-bottom: 8px; opacity: 0.8;" data-i18n="available_trail">${dicionario[lang].available_trail}</p>
                            
                            <div style="display: inline-flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 22px; border: 1px solid var(--glass-border); padding: 4px 5px 4px 14px;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-right: 18px;">
                                    <i class="bi bi-signpost-2" style="color: var(--honey-yellow); font-size: 0.85rem;"></i>
                                    <span style="color: var(--warm-cream); font-size: 0.75rem; font-weight: 600;" data-i18n="trail_name">${dicionario[lang].trail_name}</span>
                                </div>
                                <button id="btn-start-actual-trail" data-i18n="btn_start_trail" style="background: var(--honey-yellow); color: var(--soft-black); border: none; padding: 6px 16px; border-radius: 18px; font-size: 0.65rem; font-weight: 800; cursor: pointer; text-transform: uppercase; flex-shrink: 0;">${dicionario[lang].btn_start_trail}</button>
                            </div>
                            
                        </div>
                    `;
                    
                    setTimeout(() => {
                        const btnStartActual = document.getElementById('btn-start-actual-trail');
                        if (btnStartActual) {
                            btnStartActual.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                iniciarTrilhaDeFato(); 
                            });
                        }
                    }, 50);
                }
            } else {
                
                // --- LÓGICA DE EXPANSÃO QUANDO A TRILHA JÁ COMEÇOU ---
                if (btnCheckin && passoTrilhaAtual < roteiroTrilha.length) btnCheckin.classList.add('visible'); 
                
                const bPrev = document.getElementById('btn-prev-point');
                const bNext = document.getElementById('btn-next-point');
                const bExit = document.getElementById('btn-exit-trail');
                
                if (bPrev) { bPrev.style.display = ''; bPrev.classList.add('visible'); }
                if (bNext) { bNext.style.display = ''; bNext.classList.add('visible'); }
                if (bExit) { bExit.style.display = ''; }
                
                const pillMain = document.getElementById('pill-main-text');
                const pillSub = document.getElementById('pill-sub-text');
                const lang = localStorage.getItem('beezita_lang') || 'pt';
                
                if (pillMain && pillSub) {
                    pillMain.setAttribute('data-i18n', 'continue_trail');
                    pillMain.innerText = dicionario[lang].continue_trail || "CONTINUE PELA TRILHA";
                    
                    pillSub.style.display = "block";
                    pillSub.setAttribute('data-i18n', 'click_expand');
                    pillSub.innerText = dicionario[lang].click_expand || "CLIQUE PARA EXPANDIR";
                }
                
                setTimeout(() => focarPontoTrilha(false), 400); 
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (!homeProgressPanel.classList.contains('contracted')) {
            
            // TRAVA DE SEGURANÇA: Impede que a ilha feche sozinha se a tela de Parabéns estiver ativa
            const bTimer = document.getElementById('btn-timer-close');
            if (bTimer && bTimer.classList.contains('visible')) {
                return; // Interrompe a função aqui e mantém a ilha expandida
            }

            // Regra normal de fechar clicando fora (se não estiver na tela de Parabéns)
            if (!e.target.closest('#home-progress-panel') && !e.target.closest('.map-floating-round-btn') && !e.target.closest('#btn-checkin') && !e.target.closest('.bottom-nav') && !e.target.closest('.top-header')) {
                homeProgressPanel.classList.add('contracted');
                const trailNavGroup = document.querySelector('.trail-nav-group');
                if (trailNavGroup) trailNavGroup.classList.remove('expanded-mode');
                if (btnCheckin) btnCheckin.classList.remove('visible');
            }
        }
    });
}

function iniciarTrilhaDeFato() {
    isTrailStarted = true;
    
    if (camadaTrilhasGeoJSON) {
        const btnClaroAtivo = document.querySelector('.mode-control .segment-btn[data-mode="light"]')?.classList.contains('active');
        const btnSistemaAtivo = document.querySelector('.mode-control .segment-btn[data-mode="system"]')?.classList.contains('active');
        const sistemaClaro = window.matchMedia('(prefers-color-scheme: light)').matches;
        const temaAtual = btnClaroAtivo || (btnSistemaAtivo && sistemaClaro) ? 'light' : 'dark';
        aplicarTemaMapa(temaAtual);
    }

    if (mapaTrilha) mapaTrilha.closePopup(); 
    
    Object.keys(marcadoresNoMapa).forEach(nome => {
        const isBeeStation = nome.includes("Casa") || nome.includes("Hotel") || nome.includes("Meliponário");
        if (isBeeStation) {
            marcadoresNoMapa[nome].unbindPopup(); 
        }
    });

    const pPanel = document.getElementById('home-progress-panel');
    const progressInfo = document.querySelector('.progress-info');
    const bPrev = document.getElementById('btn-prev-point');
    const bNext = document.getElementById('btn-next-point');
    const bExit = document.getElementById('btn-exit-trail');
    const btnCheckin = document.getElementById('btn-checkin');
    
    pPanel.classList.add('contracted');
    
    setTimeout(() => {
        // MÁGICA AQUI: Declarando o idioma antes de preencher o innerHTML
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        
        if (progressInfo) {
            progressInfo.style.paddingRight = ''; 
            progressInfo.style.marginTop = '';
            progressInfo.innerHTML = `
                <span class="progress-subtitle" data-i18n="trail_started">${dicionario[lang].trail_started}</span>
                <span class="progress-action-text" data-i18n="go_to_gate_expanded">${dicionario[lang].go_to_gate_expanded}</span>
                <h2 class="progress-title"><strong id="contador-estacoes">0</strong> / 9 <span data-i18n="stations_visited">${dicionario[lang].stations_visited}</span></h2>
                <div class="progress-bar-container" id="acessibilidade-barra-trilha" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" style="width: 0%;"></div>
                </div>
            `;
        }
        pPanel.classList.remove('contracted');
        if (typeof exibirAvisoPreservacao === 'function') exibirAvisoPreservacao();
        if (bPrev) { bPrev.style.display = ''; bPrev.classList.add('visible'); }
        if (bNext) { bNext.style.display = ''; bNext.classList.add('visible'); }
        if (bExit) { bExit.style.display = ''; }
        if (btnCheckin && passoTrilhaAtual < roteiroTrilha.length) { btnCheckin.classList.add('visible'); }

        const pillMain = document.getElementById('pill-main-text');
        const pillSub = document.getElementById('pill-sub-text');
        
        if (pillMain && pillSub) {
            pillMain.innerText = dicionario[lang].continue_trail || "CONTINUE PELA TRILHA";
            pillSub.style.display = "block";
            pillSub.innerText = dicionario[lang].click_expand || "CLIQUE PARA EXPANDIR";
        }
        
        setTimeout(() => focarPontoTrilha(false), 100);
    }, 400);
}

if (btnCheckin) {
    btnCheckin.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (isHapticEnabled && navigator.vibrate) navigator.vibrate(50);
        
        const nomeAlvo = roteiroTrilha[passoTrilhaAtual];
        
        // --- SINCRONIA: O "Estou aqui" da trilha marca a coleção e o mapa como visitado! ---
        const safeName = nomeAlvo.replace(/\s+/g, '-').toLowerCase();
        localStorage.setItem(`poi_visited_${safeName}`, 'true');
        if (typeof renderizarColecao === 'function') renderizarColecao();
        // -----------------------------------------------------------------------------------------

        const ehEstacaoRecompensa = nomeAlvo.includes("Casa de abelha") || 
                                   nomeAlvo.includes("Hotel") || 
                                   nomeAlvo.includes("Meliponário");

        if (ehEstacaoRecompensa) {
            alternarModoUI('recompensa');
        } else {
            if (passoTrilhaAtual < roteiroTrilha.length - 1) {
                passoTrilhaAtual++;
                focarPontoTrilha();
            }
        }
    });
}

// VARIÁVEIS DO MAPA
var mapaTrilha;
var marcadorUsuario;
var mapTileLayer;
var camadaTrilhasGeoJSON;
// DECLARAÇÃO GLOBAL OBRIGATÓRIA PARA OS GRUPOS FUNCIONAREM
var grupoPontosPrincipais = L.layerGroup();
var grupoPontosSecundarios = L.layerGroup();

function inicializarMapaReal() {
    const containerMapa = document.getElementById('mapa-mhnjb');
    if (!containerMapa) return;

    if (mapaTrilha !== undefined && mapaTrilha !== null) { mapaTrilha.remove(); }

    const latitudeCentro = -19.8935;
    const longitudeCentro = -43.9135;
    const limitesDoMuseu = L.latLngBounds(L.latLng(-19.8980, -43.9220), L.latLng(-19.8850, -43.9100));

    // AQUI ESTAVA O SEU ERRO (O LEAFLET TINHA SIDO EXCLUÍDO) - AGORA ELE VOLTOU
    mapaTrilha = L.map('mapa-mhnjb', {
        zoomControl: false, maxBounds: limitesDoMuseu, maxBoundsViscosity: 1.0,   
        minZoom: 16, maxZoom: 20
    }).setView([latitudeCentro, longitudeCentro], 17);

    const token = 'pk.eyJ1Ijoid2lsc2kyNDQiLCJhIjoiY21wNzB0Mjh4MDF2aDJwcHRucnEzbW9sMyJ9.E8maQPtBHhWt4-TNZXt--w';
    const mapboxUrl = `https://api.mapbox.com/styles/v1/wilsi244/cmpbsrijn007n01s1exze9lik/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;

    mapTileLayer = L.tileLayer(mapboxUrl, { attribution: '© Mapbox', maxNativeZoom: 18, maxZoom: 20 });
    mapTileLayer.addTo(mapaTrilha);
    document.querySelector('.leaflet-control-attribution').style.display = 'none';

    if (typeof dadosTrilhaMHNJB !== 'undefined') {
        camadaTrilhasGeoJSON = L.geoJSON(dadosTrilhaMHNJB, {
            style: function (feature) {
                if (feature.geometry && feature.geometry.type === 'LineString') {
                    const nomeTrilha = (feature.properties && feature.properties.name) ? feature.properties.name : "";
                    if (nomeTrilha === "Trilha da Polinização MHNJB") {
                        return { 
                            color: isTrailStarted ? '#FFD15C' : 'var(--warm-cream)', 
                            weight: isTrailStarted ? 4 : 2, 
                            opacity: isTrailStarted ? 0.8 : 0.35, 
                            dashArray: isTrailStarted ? '8, 12' : '3, 6' 
                        };
                    }
                    return { color: 'var(--warm-cream)', weight: 2, opacity: 0.35, dashArray: '3, 6' };
                }
            },
            pointToLayer: function (feature, latlng) {
                const nome = feature.properties.name || "";
                const icone = criarIconeGeografico(nome, 'pending');
                const marcador = L.marker(latlng, { icon: icone });
                const nomeExibicao = (nome.includes("Sapucaia")) ? "Sapucaia" : nome;
                const safeName = nome.replace(/\s+/g, '-').toLowerCase();
                
                const nomeLower = nome.toLowerCase();
                const isExcludedPOI = nomeLower.includes("bebedouro") || nomeLower.includes("sanitário") || nomeLower.includes("portaria");
                const isBeeStation = nome.includes("Casa") || nome.includes("Hotel") || nome.includes("Meliponário");

                // Inteligência de tradução de nomes compostos
                let tituloTraduzidoHTML = nomeExibicao;
                if (nome.startsWith("Casa de abelha")) {
                    const num = nome.replace(/\D/g, ''); // Isola o número ("4")
                    tituloTraduzidoHTML = `<span data-i18n="poi_bee_house">Casa de abelha</span> ${num}`;
                } else if (nome === "Hotel para abelhas solitárias") {
                    tituloTraduzidoHTML = `<span data-i18n="poi_bee_hotel">Hotel para abelhas solitárias</span>`;
                } else if (nome === "Meliponário") {
                    tituloTraduzidoHTML = `<span data-i18n="poi_meliponary">Meliponário</span>`;
                }

                let popupContent = `<div class="popup-poi-container"><strong style="color: #333; font-size: 0.85rem;">${tituloTraduzidoHTML}</strong>`;

                if (!isExcludedPOI) {
                    const isVisited = localStorage.getItem(`poi_visited_${safeName}`) === 'true';
                    if (isVisited) {
                        popupContent += `<button class="poi-visit-btn visited" onclick="window.togglePoiVisit(this, '${safeName}')"><span data-i18n="poi_visited">Visitado</span> <i class="bi bi-check-lg"></i></button>`;
                    } else {
                        popupContent += `<button class="poi-visit-btn" onclick="window.togglePoiVisit(this, '${safeName}')"><span data-i18n="poi_mark_visited">Marcar como visitado</span></button>`;
                    }
                }

                if (isBeeStation) {
                    popupContent += `<span class="poi-ver-mais" onclick="window.abrirRecompensaAvulsa('${nome}')" data-i18n="poi_see_more">Ver mais</span>`;
                }
                
                popupContent += `</div>`;

                marcador.customPopupContent = popupContent; 
                
                marcador.bindPopup(popupContent);
                marcador.on('click', () => trazerParaFrente(nome));
                
                marcadoresNoMapa[nome] = marcador;
                return marcador; 
            }
        }).addTo(mapaTrilha);

        const mapContainer = document.getElementById('mapa-mhnjb');
        
        if (mapaTrilha.getZoom() < 18) {
            mapContainer.classList.add('zoom-afastado');
        }

        mapaTrilha.on('zoomend', function() {
            if (mapaTrilha.getZoom() < 18) {
                mapContainer.classList.add('zoom-afastado');
            } else {
                mapContainer.classList.remove('zoom-afastado');
            }
        });
    }

    const iconBolinhaAzul = L.divIcon({
        className: 'gps-blue-dot-marker',
        html: `
            <div style="
                position: relative;
                width: 18px; height: 18px;
                background-color: #007AFF;
                border: 2.5px solid #FFFFFF;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex; align-items: center; justify-content: center;
            ">
                <div style="
                    position: absolute;
                    width: 36px; height: 36px;
                    background-color: rgba(0, 122, 255, 0.25);
                    border-radius: 50%;
                    z-index: -1;
                    animation: pulse-pino 2s infinite ease-in-out;
                "></div>
            </div>
        `,
        iconSize: [36, 36], 
        iconAnchor: [18, 18] 
    });
    
    marcadorUsuario = L.marker([latitudeCentro, longitudeCentro], { icon: iconBolinhaAzul, zIndexOffset: 1000 }).addTo(mapaTrilha);

    // --- MOTOR DO GPS COM TRAVA DE LIMITES ---
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const posicaoReal = L.latLng(lat, lng);
                
                if (limitesDoMuseu.contains(posicaoReal)) {
                    if (marcadorUsuario) {
                        marcadorUsuario.setLatLng(posicaoReal);
                        marcadorUsuario.setOpacity(1); 
                    }
                } else {
                    if (marcadorUsuario) marcadorUsuario.setOpacity(0);
                }
            },
            (error) => { console.warn("GPS: ", error.message); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }

    mapaTrilha.on('popupopen', function(e) {
        const popupNode = e.popup._contentNode;
        if (!popupNode) return;
        
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        
        const btn = popupNode.querySelector('.poi-visit-btn');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (match && match[1]) {
                const safeName = match[1];
                const isVisited = localStorage.getItem(`poi_visited_${safeName}`) === 'true';
                
                if (isVisited) {
                    btn.classList.add('visited');
                    btn.innerHTML = `<span data-i18n="poi_visited">${dicionario[lang].poi_visited || "Visitado"}</span> <i class="bi bi-check-lg"></i>`;
                } else {
                    btn.classList.remove('visited');
                    btn.innerHTML = `<span data-i18n="poi_mark_visited">${dicionario[lang].poi_mark_visited || "Marcar como visitado"}</span>`;
                }
            }
        }
        
        // MÁGICA: Manda traduzir qualquer tag data-i18n dentro do balão que acabou de nascer
        aplicarIdioma(lang);
    });

    setTimeout(() => mapaTrilha.invalidateSize(), 500);
}

inicializarMapaReal();

inicializarMapaReal();

// --- FUNÇÃO DO BOTÃO DE VISITADO DOS POIs NO MAPA ---
window.togglePoiVisit = function(btn, safeName) {
    window.togglePoiVisitGlobal(safeName); // Chama o motor global de sincronia que escrevemos
};

function trazerParaFrente(nome) {
    Object.values(marcadoresNoMapa).forEach(m => m.setZIndexOffset(0));
    if (marcadoresNoMapa[nome]) {
        marcadoresNoMapa[nome].setZIndexOffset(1000);
    }
}

// --- NOVA FUNÇÃO: ABRIR RECOMPENSA FORA DA TRILHA (AVULSA) ---
window.abrirRecompensaAvulsa = function(nomeAlvo) {
    const overlay = document.getElementById('discovery-overlay');
    const btnNext = document.getElementById('btn-next-point');
    const btnCheck = document.getElementById('btn-checkin');

    document.body.classList.add('recompensa-ativa'); // Oculta o header do app
    overlay.classList.add('active');
    if (btnCheck) btnCheck.classList.remove('visible'); 
    
    // NOVIDADE: Esconde explicitamente a seta de voltar no modo "Ver Mais"
    const btnPrev = document.getElementById('btn-prev-point');
    if (btnPrev) btnPrev.style.display = 'none'; 
    
    // Prepara o botão para ser apenas de fechar (não avança a trilha)
    btnNext.classList.remove('nav-disabled', 'btn-is-concluir', 'btn-continuar-mode', 'is-final');
    btnNext.classList.add('btn-fechar-avulso'); 
    btnNext.disabled = false; // Destrava para o leitor de tela
    btnNext.setAttribute('aria-disabled', 'false');

    // --- LÓGICA NOVA: Puxa o Idioma e a Imagem correta da coleção dinamicamente ---
    const lang = localStorage.getItem('beezita_lang') || 'pt';
    const dadosGerais = recompensasDados[nomeAlvo];
    const dados = dadosGerais ? dadosGerais[lang] : null;

    const safeName = nomeAlvo.replace(/\s+/g, '-').toLowerCase();
    const itemColecao = colecaoDados.find(item => item.id === safeName);
    const imagemAlvo = itemColecao ? itemColecao.img : 'assets/images/trocarimagem.webp';
    document.querySelector('.discovery-honeycomb-inner').style.backgroundImage = `url('${imagemAlvo}')`;
    // -------------------------------------------------------------------

    if (dados) {
        document.querySelector('.discovery-title').innerHTML = dados.titulo;
        document.querySelector('.discovery-description').innerHTML = dados.descricao;
        document.querySelector('.discovery-curiosity').innerHTML = dados.curiosidade;
        
        if (dados.badge) {
            document.querySelector('.discovery-badge').innerHTML = dados.badge;
            document.querySelector('.discovery-badge').removeAttribute('data-i18n');
        } else {
            document.querySelector('.discovery-badge').innerHTML = dicionario[lang].new_discovery;
            document.querySelector('.discovery-badge').setAttribute('data-i18n', 'new_discovery'); 
        }
    } else {
        const fallbacks = {
            pt: { title: `Espécie Desconhecida <span class="scientific-name">(...)</span>`, desc: `Você descobriu a ${nomeAlvo}! O texto descritivo desta estação será adicionado em breve.`, cur: `<strong>Curiosidade:</strong> A natureza guarda muitos segredos.` },
            en: { title: `Unknown Species <span class="scientific-name">(...)</span>`, desc: `You discovered ${nomeAlvo}! The descriptive text for this station will be added soon.`, cur: `<strong>Curiosity:</strong> Nature holds many secrets.` },
            es: { title: `Especie Desconocida <span class="scientific-name">(...)</span>`, desc: `¡Descubriste la ${nomeAlvo}! El texto descriptivo de esta estación se agregará pronto.`, cur: `<strong>Curiosidad:</strong> La naturaleza guarda muchos secretos.` }
        };
        document.querySelector('.discovery-title').innerHTML = fallbacks[lang].title;
        document.querySelector('.discovery-description').innerHTML = fallbacks[lang].desc;
        document.querySelector('.discovery-curiosity').innerHTML = fallbacks[lang].cur;
        document.querySelector('.discovery-badge').innerHTML = dicionario[lang].new_discovery;
        document.querySelector('.discovery-badge').setAttribute('data-i18n', 'new_discovery');
    }

    // Texto do botão adaptado para bolinha (só o ícone)
    btnNext.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
};

// Nova função para garantir o fechamento absoluto da tela de recompensa
function fecharModoRecompensa() {
    const overlay = document.getElementById('discovery-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('recompensa-ativa'); // Garante que o header volte
    
    if (btnNextPoint) {
        btnNextPoint.classList.remove('btn-continuar-mode');
        btnNextPoint.innerHTML = '<i class="bi bi-chevron-right"></i>';
    }
}

function alternarModoUI(modo) {
    const overlay = document.getElementById('discovery-overlay');
    const btnNext = document.getElementById('btn-next-point');
    const btnCheck = document.getElementById('btn-checkin');

    if (modo === 'recompensa') {
        document.body.classList.add('recompensa-ativa'); // Oculta o header do app
        overlay.classList.add('active');
        if (btnCheck) btnCheck.classList.remove('visible'); 
        
        // LIMPEZA ANTI-TRAVAMENTO: Remove classes avulsas para as funções não baterem cabeça
        btnNext.classList.remove('nav-disabled', 'btn-fechar-avulso', 'is-final', 'btn-is-concluir');
        btnNext.classList.add('btn-continuar-mode');
        btnNext.disabled = false; // Destrava para o leitor de tela
        btnNext.setAttribute('aria-disabled', 'false');

        const nomeAlvo = roteiroTrilha[passoTrilhaAtual];
        
        // --- LÓGICA NOVA: Puxa o Idioma e a Imagem correta da coleção dinamicamente ---
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        const dadosGerais = recompensasDados[nomeAlvo];
        const dados = dadosGerais ? dadosGerais[lang] : null;

        const safeName = nomeAlvo.replace(/\s+/g, '-').toLowerCase();
        const itemColecao = colecaoDados.find(item => item.id === safeName);
        const imagemAlvo = itemColecao ? itemColecao.img : 'assets/images/trocarimagem.webp';
        document.querySelector('.discovery-honeycomb-inner').style.backgroundImage = `url('${imagemAlvo}')`;
        // -------------------------------------------------------------------

        if (dados) {
            document.querySelector('.discovery-title').innerHTML = dados.titulo;
            document.querySelector('.discovery-description').innerHTML = dados.descricao;
            document.querySelector('.discovery-curiosity').innerHTML = dados.curiosidade;
            
            if (dados.badge) {
                document.querySelector('.discovery-badge').innerHTML = dados.badge;
                document.querySelector('.discovery-badge').removeAttribute('data-i18n');
            } else {
                document.querySelector('.discovery-badge').innerHTML = dicionario[lang].new_discovery;
                document.querySelector('.discovery-badge').setAttribute('data-i18n', 'new_discovery'); 
            }
        } else {
            const fallbacks = {
                pt: { title: `Espécie Desconhecida <span class="scientific-name">(...)</span>`, desc: `Você descobriu a ${nomeAlvo}! O texto descritivo desta estação será adicionado em breve.`, cur: `<strong>Curiosidade:</strong> A natureza guarda muitos segredos.` },
                en: { title: `Unknown Species <span class="scientific-name">(...)</span>`, desc: `You discovered ${nomeAlvo}! The descriptive text for this station will be added soon.`, cur: `<strong>Curiosity:</strong> Nature holds many secrets.` },
                es: { title: `Especie Desconocida <span class="scientific-name">(...)</span>`, desc: `¡Descubriste la ${nomeAlvo}! El texto descriptivo de esta estación se agregará pronto.`, cur: `<strong>Curiosidad:</strong> La naturaleza guarda muchos secretos.` }
            };
            document.querySelector('.discovery-title').innerHTML = fallbacks[lang].title;
            document.querySelector('.discovery-description').innerHTML = fallbacks[lang].desc;
            document.querySelector('.discovery-curiosity').innerHTML = fallbacks[lang].cur;
            document.querySelector('.discovery-badge').innerHTML = dicionario[lang].new_discovery;
            document.querySelector('.discovery-badge').setAttribute('data-i18n', 'new_discovery');
        }

        if (nomeAlvo === "Meliponário") {
            const txtConcluir = lang === 'en' ? 'FINISH' : 'CONCLUIR';
            btnNext.innerHTML = `<span>${txtConcluir}</span> <i class="bi bi-check-lg" aria-hidden="true"></i>`;
            btnNext.classList.add('btn-is-concluir');
        } else {
            const txtContinuar = lang === 'en' ? 'CONTINUE' : 'CONTINUAR';
            btnNext.innerHTML = `<span>${txtContinuar}</span> <i class="bi bi-chevron-right" aria-hidden="true"></i>`;
            btnNext.classList.remove('btn-is-concluir');
        }

    } else {
        document.body.classList.remove('recompensa-ativa'); // Devolve o header
        overlay.classList.remove('active');
        
        // TRANSFORMAÇÃO INSTANTÂNEA: Remove a classe na hora para a pílula encolher suavemente
        btnNext.classList.remove('btn-continuar-mode');
        
        if(btnNext.classList.contains('is-final')) {
             btnNext.innerHTML = '<i class="bi bi-check-lg"></i>';
        } else {
             btnNext.innerHTML = '<i class="bi bi-chevron-right"></i>';
        }
        
        // O botão Estou Aqui recebe o comando para subir ao mesmo tempo
        if (passoTrilhaAtual < roteiroTrilha.length) {
            if (btnCheck) btnCheck.classList.add('visible'); 
        }
    }
}

const exitOverlay = document.getElementById('exit-confirm-overlay');
const btnExitTrail = document.getElementById('btn-exit-trail');
const btnContinueNav = document.getElementById('btn-continue-nav');
const btnConfirmExit = document.getElementById('btn-confirm-exit');

// Abrir modal de saída
if (btnExitTrail) {
    btnExitTrail.addEventListener('click', (e) => {
        // TRAVA DE SEGURANÇA: Se a recompensa estiver ativa, ignora o clique
        const overlayAtivo = document.getElementById('discovery-overlay').classList.contains('active');
        if (overlayAtivo) return; 

        e.stopPropagation();
        exitOverlay.classList.add('active');
    });
}

// Fechar modal (Continuar)
btnContinueNav?.addEventListener('click', () => exitOverlay.classList.remove('active'));

// Confirmar Saída (Resetar tudo)
btnConfirmExit?.addEventListener('click', () => {
    exitOverlay.classList.remove('active');
    
    // Simplesmente chame a função resetarTrilha() aqui!
    // Ela já reseta as variáveis, limpa a UI, reseta o estilo da trilha para cinza e trava o mapa
    resetarTrilha();
});

function iniciarConclusao() {
    const pPanel = document.getElementById('home-progress-panel');
    const bTimer = document.getElementById('btn-timer-close');
    const bNext = document.getElementById('btn-next-point');
    const bPrev = document.getElementById('btn-prev-point');
    const bExit = document.getElementById('btn-exit-trail');
    const progressInfo = document.querySelector('.progress-info');
    
    const rewardScreen = document.getElementById('discovery-overlay');
    if (rewardScreen) rewardScreen.classList.remove('active');
    document.body.classList.remove('recompensa-ativa'); // Devolve o header no parabéns

    // --- MUDANÇA: Parar de piscar o marcador final no mapa ---
    const nomeAlvo = roteiroTrilha[passoTrilhaAtual];
    if (marcadoresNoMapa && marcadoresNoMapa[nomeAlvo]) {
        marcadoresNoMapa[nomeAlvo].setIcon(criarIconeGeografico(nomeAlvo, 'visited'));
    }
    // ---------------------------------------------------------

    // MÁGICA DA TRANSIÇÃO: Trava a posição na marra para não "piscar nem subir"
    if (bNext) {
        bNext.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
        bNext.style.setProperty('z-index', '9999', 'important');
        
        bNext.classList.remove('btn-continuar-mode', 'btn-is-concluir', 'is-final');
        bNext.innerHTML = ''; // Limpa o texto para a bolinha fechar perfeita
    }
    
    if (bPrev) bPrev.style.display = 'none';
    if (bExit) bExit.style.display = 'none'; 
    
    if (progressInfo) {
        progressInfo.style.setProperty('padding-right', '0px', 'important');
        progressInfo.style.setProperty('margin-top', '0px', 'important');
    }

    pPanel.classList.add('contracted');
    
    setTimeout(() => {
        if (bNext) {
            bNext.style.display = 'none'; // Botão ocultado dando espaço pro botão Sair
            bNext.style.removeProperty('transform'); // Limpa a trava
            bNext.style.removeProperty('z-index'); // Limpa a trava
        }
        
        // --- EFEITO PULSANTE E INCANDESCENTE APLICADO NO H2 ---
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        const txtCongrats = dicionario[lang].trail_congrats || "PARABÉNS!";
        const txtComp = dicionario[lang].trail_completed || "Você completou a trilha.";
        const txtEnjoy = dicionario[lang].trail_enjoy || "Desfrute outros espaços do museu MHNJB.";
        const txtSair = dicionario[lang].trail_exit_btn || "SAIR";

        progressInfo.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; width: 100%; height: 100%; min-height: 85px;">
                <h2 style="color: var(--honey-yellow); font-size: 1.1rem; margin-bottom: 2px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; animation: smooth-blink 2s ease-in-out infinite; text-shadow: 0 0 8px var(--glow-yellow);" data-i18n="trail_congrats">${txtCongrats}</h2>
                <p style="color: var(--warm-cream); font-size: 0.8rem; margin-bottom: 4px; text-transform: uppercase; font-weight: 600;" data-i18n="trail_completed">${txtComp}</p>
                <p style="color: var(--warm-cream); font-size: 0.75rem; opacity: 0.8; font-weight: 400; line-height: 1.2;" data-i18n="trail_enjoy">${txtEnjoy}</p>
            </div>
        `;
        
        pPanel.classList.remove('contracted');
        
        bTimer.style.display = 'grid'; 
        bTimer.style.justifyContent = 'center'; 
        bTimer.style.gap = '2px';
        bTimer.classList.add('visible');

        bTimer.innerHTML = `
            <span id="timer-text" style="font-size: 0.8rem; color: var(--warm-cream); font-weight: 700; font-variant-numeric: tabular-nums; text-align: right;">15s</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--honey-yellow); margin-left: 5px;">${txtSair}</span>
        `;

        let timeLeft = 15;
        const timerText = document.getElementById('timer-text');
        
        const timerInterval = setInterval(() => {
            timeLeft--;
            timerText.innerText = timeLeft + 's';
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                resetarTrilha();
            }
        }, 1000);

        bTimer.onclick = () => {
            clearInterval(timerInterval);
            resetarTrilha();
        };
    }, 400);
}

function resetarTrilha() {
    isTrailStarted = false;
    passoTrilhaAtual = 0;

    Object.keys(marcadoresNoMapa).forEach(nome => {
        const isBeeStation = nome.includes("Casa") || nome.includes("Hotel") || nome.includes("Meliponário");
        if (isBeeStation && marcadoresNoMapa[nome].customPopupContent) {
            marcadoresNoMapa[nome].bindPopup(marcadoresNoMapa[nome].customPopupContent); 
        }
    });

    if (btnCheckin) btnCheckin.classList.remove('visible');
    
    if (camadaTrilhasGeoJSON) {
        const btnClaroAtivo = document.querySelector('.mode-control .segment-btn[data-mode="light"]')?.classList.contains('active');
        const btnSistemaAtivo = document.querySelector('.mode-control .segment-btn[data-mode="system"]')?.classList.contains('active');
        const sistemaClaro = window.matchMedia('(prefers-color-scheme: light)').matches;
        const temaAtual = btnClaroAtivo || (btnSistemaAtivo && sistemaClaro) ? 'light' : 'dark';
        aplicarTemaMapa(temaAtual);
    }

    const pPanel = document.getElementById('home-progress-panel');
    const bTimer = document.getElementById('btn-timer-close');
    const bNext = document.getElementById('btn-next-point');
    const bPrev = document.getElementById('btn-prev-point');
    const bExit = document.getElementById('btn-exit-trail');
    const progressInfo = document.querySelector('.expanded-content');
    
    const infoArea = document.querySelector('.progress-info');
    if (infoArea) {
        infoArea.style.paddingRight = ''; 
        infoArea.style.marginTop = '';
    }

    if (bTimer) { bTimer.style.display = 'none'; bTimer.classList.remove('visible'); }
    if (bNext) { 
        bNext.classList.remove('visible', 'btn-continuar-mode', 'btn-is-concluir', 'is-final');
        bNext.classList.add('nav-disabled'); 
        bNext.disabled = true; // Trava real
        bNext.setAttribute('aria-disabled', 'true');
        bNext.innerHTML = '<i class="bi bi-chevron-right" aria-hidden="true"></i>';
        bNext.style.display = ''; 
        bNext.style.removeProperty('transform');
        bNext.style.removeProperty('z-index'); 
    }
    if (bPrev) { 
        bPrev.classList.remove('visible'); 
        bPrev.disabled = true; // Trava real
        bPrev.setAttribute('aria-disabled', 'true');
        bPrev.style.display = ''; 
    }
    if (bExit) { bExit.style.display = 'none'; } 
    
    pPanel.classList.add('contracted');
    document.querySelector('.trail-nav-group').classList.remove('expanded-mode');
    
    const lang = localStorage.getItem('beezita_lang') || 'pt';
    document.getElementById('pill-main-text').innerText = dicionario[lang].start_trail || "COMEÇAR TRILHA";
    document.getElementById('pill-sub-text').style.display = "none";
    
    const oldInfo = progressInfo.querySelector('.progress-info');
    if (oldInfo) oldInfo.remove();
    
    const originalInfo = document.createElement('div');
    originalInfo.className = 'progress-info';
    originalInfo.style.marginTop = '20px';
    
    originalInfo.innerHTML = `
        <span class="progress-subtitle" data-i18n="trail_started">${dicionario[lang].trail_started}</span>
        <span class="progress-action-text" data-i18n="go_to_gate">${dicionario[lang].go_to_gate}</span>
        <h2 class="progress-title"><strong id="contador-estacoes">0</strong> / 9 <span data-i18n="stations_visited">${dicionario[lang].stations_visited}</span></h2>
        <div class="progress-bar-container" id="acessibilidade-barra-trilha" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" style="width: 0%;"></div>
        </div>
    `;
    progressInfo.appendChild(originalInfo);

    focarPontoTrilha(true); 
}

// =======================================================================
// --- LÓGICA DOS BOTÕES LATERAIS DO MAPA (CAMADAS E CENTRALIZAR) ---
// =======================================================================

// --- LÓGICA DO BOTÃO CENTRALIZAR MAPA (EVITA QUEBRA DE MAXBOUNDS E TELA BRANCA) ---
const btnRecenter = document.getElementById('btn-recenter');
if (btnRecenter) {
    btnRecenter.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(30);
        
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const posicaoReal = L.latLng(position.coords.latitude, position.coords.longitude);
                    const limitesDoMuseu = L.latLngBounds(L.latLng(-19.8980, -43.9220), L.latLng(-19.8850, -43.9100));
                    
                    if (limitesDoMuseu.contains(posicaoReal)) {
                        mapaTrilha.flyTo(posicaoReal, 18, { animate: true, duration: 1.2 });
                    } else {
                        const lang = localStorage.getItem('beezita_lang') || 'pt';
                        mostrarToastAviso(dicionario[lang].toast_far);
                        // SetView centraliza imediatamente o mapa na portaria SEM animação (evitando bater no limite e bugar o mapa)
                        mapaTrilha.setView([-19.891008, -43.913492], 17);
                    }
                },
                (error) => { 
                    const lang = localStorage.getItem('beezita_lang') || 'pt';
                    mostrarToastAviso(dicionario[lang].toast_gps_denied); 
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            mostrarToastAviso("Seu navegador não suporta geolocalização.");
        }
    });
}

function mostrarToastAviso(mensagem) {
    const toast = document.getElementById('toast-aviso');
    const texto = document.getElementById('toast-texto');
    if (!toast || !texto) return;
    texto.innerText = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// --- LÓGICA DO PAINEL DE CAMADAS (PONTOS DE INTERESSE) ---
let isLayersOpen = false;
const layersPanel = document.getElementById('layers-panel');
const closeLayersBtn = document.getElementById('close-layers-btn');
const btnMapLayers = document.getElementById('btn-map-layers');

function toggleLayersPanel() {
    if (isMenuOpen) toggleMenu();
    if (isAccessOpen) {
        isAccessOpen = false;
        document.body.classList.remove('access-open');
        topMenuBtn.innerHTML = '<i class="bi bi-list"></i>';
        topMenuBtn.setAttribute('aria-label', 'Abrir Menu');
    }

    isLayersOpen = !isLayersOpen;
    document.body.classList.toggle('layers-open', isLayersOpen);
}

if (btnMapLayers) {
    btnMapLayers.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
            navigator.vibrate(20);
        }
        toggleLayersPanel();
    });
}

if (closeLayersBtn) {
    closeLayersBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLayersPanel();
    });
}

// Ouvinte único e centralizado para fechar qualquer painel ativo clicando fora
menuOverlay.addEventListener('click', () => {
    if (isAccessOpen) toggleAccessPanel();
    if (isMenuOpen) toggleMenu();
    if (isLayersOpen) toggleLayersPanel();
});

// --- FUNCIONALIDADE DE BUSCA E FOCO NO MAPA ---
document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        const catClass = item.getAttribute('data-categoria');
        if (!catClass) return;

        // 1. Fecha o painel de camadas e dá feedback tátil
        toggleLayersPanel();
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }

        // 2. Limpa buscas anteriores
        document.querySelectorAll('.ponto-destaque-busca').forEach(el => el.classList.remove('ponto-destaque-busca'));

        // 3. Checa o zoom para garantir que itens secundários apareçam
        if (mapaTrilha && mapaTrilha.getZoom() < 18) {
            mapaTrilha.setZoom(18); 
        }

        // 4. Acende o "Radar" nos itens da categoria
        setTimeout(() => {
            const marcadoresDom = document.querySelectorAll(`.${catClass}`);
            
            marcadoresDom.forEach(el => {
                // Adiciona o destaque
                el.classList.add('ponto-destaque-busca');
                
                // Remove o destaque após a animação (3 repetições de 1.5s = 4.5s)
                setTimeout(() => {
                    el.classList.remove('ponto-destaque-busca');
                }, 4500);
            });
        }, 300);

        // 5. Acha o item dessa categoria mais próximo do centro atual da tela e voa até ele
        if (mapaTrilha) {
            let centroAtual = mapaTrilha.getCenter();
            let maisProximo = null;
            let menorDistancia = Infinity;

            mapaTrilha.eachLayer(function(layer) {
                // Filtra iterando sobre a estrutura real do Leaflet
                if (layer instanceof L.Marker && layer.options.icon && layer.options.icon.options.className && layer.options.icon.options.className.includes(catClass)) {
                    let dist = centroAtual.distanceTo(layer.getLatLng());
                    if (dist < menorDistancia) {
                        menorDistancia = dist;
                        maisProximo = layer;
                    }
                }
            });

            if (maisProximo) {
                // Voo imersivo com zoom alto
                mapaTrilha.flyTo(maisProximo.getLatLng(), 19, { animate: true, duration: 1.5 });
                setTimeout(() => { 
                    maisProximo.openPopup(); 
                }, 1500);
            }
        }
    });
});

// =======================================================================
// --- CARTAS: SISTEMA GAMIFICADO: DESAFIO (QUIZ & CURIOSIDADES) ---
// =======================================================================

const quizAbelhas = {
    pt: [
        { q: "As abelhas que aparecem na trilha são conhecidas como:", options: ["Abelhas sem ferrão", "Abelhas que não possuem asas", "Abelhas que vivem apenas em flores"], correct: 0 },
        { q: "Por que as abelhas são importantes para o museu?", options: ["Ajudam as plantas a se reproduzirem por meio da polinização", "Protegem as árvores de todos os animais", "Produzem oxigênio para as plantas respirarem"], correct: 0 },
        { q: "Como as abelhas sem ferrão guardam seus alimentos?", options: ["Em pequenos potes dentro do ninho", "Em favos iguais aos das abelhas mais conhecidas", "Dentro das folhas das plantas próximas"], correct: 0 },
        { q: "O que é um meliponário?", options: ["Um espaço onde são criadas abelhas sem ferrão", "Lugar onde todas as espécies de insetos vivem", "Um jardim feito apenas para produzir mel"], correct: 0 },
        { q: "Todas as abelhas vivem em grupos organizados?", options: ["Não. Algumas abelhas possuem hábitos solitários", "Sim. Todas as abelhas vivem em colmeias", "Sim. Toda abelha possui uma rainha"], correct: 0 }
    ],
    en: [
        { q: "The bees that appear on the trail are known as:", options: ["Stingless bees", "Wingless bees", "Bees that live only in flowers"], correct: 0 },
        { q: "Why are bees important for the museum?", options: ["They help plants reproduce through pollination", "They protect trees from all animals", "They produce oxygen for plants to breathe"], correct: 0 },
        { q: "How do stingless bees store their food?", options: ["In small pots inside the nest", "In honeycombs like the most common bees", "Inside the leaves of nearby plants"], correct: 0 },
        { q: "What is a meliponary?", options: ["A space where stingless bees are raised", "A place where all insect species live", "A garden made solely to produce honey"], correct: 0 },
        { q: "Do all bees live in organized groups?", options: ["No. Some bees have solitary habits", "Yes. All bees live in hives", "Yes. Every bee has a queen"], correct: 0 }
    ],
    es: [
        { q: "Las abejas que aparecen en el sendero se conocen como:", options: ["Abejas sin aguijón", "Abejas que no tienen alas", "Abejas que viven solo en flores"], correct: 0 },
        { q: "¿Por qué las abejas son importantes para el museo?", options: ["Ayudan a las plantas a reproducirse mediante la polinización", "Protegen los árboles de todos los animales", "Producen oxígeno para que las plantas respiren"], correct: 0 },
        { q: "¿Cómo guardan su alimento las abejas sin aguijón?", options: ["En pequeños potes dentro del nido", "En panales iguales a los de las abejas más conocidas", "Dentro de las hojas de las plantas cercanas"], correct: 0 },
        { q: "¿Qué es un meliponario?", options: ["Un espacio donde se crían abejas sin aguijón", "Un lugar donde viven todas las especies de insectos", "Un jardín hecho solo para producir miel"], correct: 0 },
        { q: "¿Todas las abejas viven en grupos organizados?", options: ["No. Algunas abejas tienen hábitos solitarios", "Sí. Todas las abejas viven en colmenas", "Sí. Toda abeja tiene una reina"], correct: 0 }
    ]
};

const curiosidadesMHNJB = {
    pt: [
        { title: "Você sabia?", text: "No meio da cidade existe um pedaço de Mata Atlântica! O MHNJB guarda uma grande área verde que funciona como um refúgio para a biodiversidade." },
        { title: "Muitos Habitantes", text: "Além das plantas, abriga aves, pequenos mamíferos e insetos. Às vezes, os menores moradores são os que fazem os maiores trabalhos." },
        { title: "Histórias das Plantas", text: "As plantas não são apenas decoração: elas alimentam animais, protegem o solo e algumas fazem parte de rigorosas pesquisas científicas." },
        { title: "Passado e Presente", text: "O museu guarda coleções de botânica, zoologia e arqueologia. Você encontra desde seres vivos atuais até registros fósseis." },
        { title: "Presépio Patrimônio", text: "Abriga o famoso Presépio do Pipiripau. Uma obra com cenas móveis que é reconhecida como patrimônio histórico nacional." }
    ],
    en: [
        { title: "Did you know?", text: "In the middle of the city, there is a piece of the Atlantic Forest! The MHNJB preserves a large green area that acts as a refuge for biodiversity." },
        { title: "Many Inhabitants", text: "Besides plants, it houses birds, small mammals, and insects. Sometimes, the smallest residents do the biggest jobs." },
        { title: "Plant Stories", text: "Plants are not just decoration: they feed animals, protect the soil, and some are part of rigorous scientific research." },
        { title: "Past and Present", text: "The museum holds botany, zoology, and archaeology collections. You can find everything from modern living beings to fossil records." },
        { title: "Heritage Nativity Scene", text: "It houses the famous Pipiripau Nativity Scene. A piece with moving scenes that is recognized as a national historical heritage." }
    ],
    es: [
        { title: "¿Sabías que?", text: "¡En medio de la ciudad hay un pedazo de Mata Atlántica! El MHNJB conserva una gran área verde que funciona como refugio para la biodiversidad." },
        { title: "Muchos Habitantes", text: "Además de plantas, alberga aves, pequeños mamíferos e insectos. A veces, los residentes más pequeños hacen los trabajos más grandes." },
        { title: "Historias de las Plantas", text: "Las plantas no son solo decoración: alimentan a los animales, protegen el suelo y algunas forman parte de rigurosas investigaciones científicas." },
        { title: "Pasado y Presente", text: "El museo guarda colecciones de botánica, zoología y arqueología. Puedes encontrar desde seres vivos actuales hasta registros fósiles." },
        { title: "Pesebre Patrimonio", text: "Alberga el famoso Pesebre de Pipiripau. Una obra con escenas móviles reconocida como patrimonio histórico nacional." }
    ]
};

let gameState = { mode: 'quiz', index: 0, locked: false, correct: 0 };

function embaralharOpcoes(opcoes, indiceCorreto) {
    let array = opcoes.map((texto, i) => ({ texto, ehCorreto: i === indiceCorreto }));
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderizarCartas() {
    const stack = document.getElementById('card-stack');
    if (!stack) return;
    
    // Puxa o idioma atual (se não tiver, usa pt)
    const lang = localStorage.getItem('beezita_lang') || 'pt';
    
    // MÁGICA: Agora acessamos a aba de idioma correta do nosso banco de dados trilíngue
    const data = gameState.mode === 'quiz' ? quizAbelhas[lang] : curiosidadesMHNJB[lang];
    const total = data.length;
    
    // Atualiza Progresso e Textos
    const txtCartas = dicionario[lang].game_cards || "cartas";
    
    document.getElementById('game-progress-text').innerText = `${gameState.index} / ${total} ${txtCartas}`;
    document.getElementById('game-header-title').innerText = gameState.mode === 'quiz' ? (dicionario[lang].game_title_quiz || 'QUIZ DAS ABELHAS') : (dicionario[lang].game_title_cur || 'CURIOSIDADES MHNJB');
    document.getElementById('game-header-subtitle').innerText = gameState.mode === 'quiz' ? (dicionario[lang].game_sub_quiz || 'Teste seus conhecimentos!') : (dicionario[lang].game_sub_cur || 'Deslize e descubra');
    document.getElementById('game-progress-bar').style.width = `${(gameState.index / total) * 100}%`;

    // Cria as 3 cartas (Front, Middle, Back) para o efeito 3D
    stack.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let cardIdx = gameState.index + i;
        if (cardIdx >= total) break; // Acabaram as cartas

        let cardData = data[cardIdx];
        let cardEl = document.createElement('div');
        cardEl.className = `game-card ${i === 0 ? 'card-front' : (i === 1 ? 'card-middle' : 'card-back')}`;
        
        let conteudo = '';
        if (gameState.mode === 'quiz') {
            conteudo = `<div class="game-card-badge">${dicionario[lang].game_question} ${cardIdx + 1}</div>
                        <div class="game-card-title">${cardData.q}</div>`;
        } else {
            conteudo = `<div class="game-card-badge">${dicionario[lang].game_curiosity} ${cardIdx + 1}</div>
                        <div class="game-card-title">${cardData.title}</div>
                        <div class="game-card-text">${cardData.text}</div>`;
        }
        cardEl.innerHTML = conteudo;
        stack.appendChild(cardEl);
    }

    // Gerencia a Área de Baixo
    const quizArea = document.getElementById('quiz-options-container');
    const hintArea = document.getElementById('swipe-hint-container');
    const restartArea = document.getElementById('restart-container');

    if (gameState.index >= total) {
        // Fim de jogo: Telas Animadas separadas por modo e TRADUZIDAS
        let finalHtml = '';
        if (gameState.mode === 'quiz') {
            finalHtml = `
                <div class="game-card card-front" style="justify-content: center;">
                    <div class="game-card-title" style="font-size: 1.5rem; margin-bottom: 5px;">${dicionario[lang].game_congrats}</div>
                    <div class="game-card-text" style="margin-bottom: 25px;">${dicionario[lang].game_quiz_done}</div>
                    <div class="score-pop">
                        <span style="font-size: 0.8rem; text-transform: uppercase;">${dicionario[lang].game_score}</span><br>
                        <span style="font-size: 1.8rem; font-weight: 800;">${gameState.correct} / ${total}</span>
                    </div>
                </div>`;
        } else {
            finalHtml = `
                <div class="game-card card-front" style="justify-content: center;">
                    <div class="game-card-title" style="font-size: 1.5rem;">${dicionario[lang].game_congrats}</div>
                    <div class="game-card-text">${dicionario[lang].game_cards_done}</div>
                </div>`;
        }

        stack.innerHTML = finalHtml;
        quizArea.style.display = 'none';
        hintArea.style.display = 'none';
        if (restartArea) restartArea.style.display = 'flex';
        return;
    } else {
        if (restartArea) restartArea.style.display = 'none';
    }

    if (gameState.mode === 'quiz') {
        quizArea.style.display = 'flex'; hintArea.style.display = 'none';
        quizArea.classList.remove('locked');
        
        // Embaralha as respostas na tela
        let respostasMapeadas = embaralharOpcoes(data[gameState.index].options, data[gameState.index].correct);
        
        for (let i = 0; i < 3; i++) {
            let btn = document.getElementById(`btn-opt-${i}`);
            btn.className = 'quiz-btn'; // Limpa cores
            btn.innerHTML = `<strong>${String.fromCharCode(65 + i)})</strong>&nbsp;&nbsp;${respostasMapeadas[i].texto}`;
            btn.dataset.correto = respostasMapeadas[i].ehCorreto;
        }
        gameState.locked = false;
    } else {
        quizArea.style.display = 'none'; hintArea.style.display = 'flex';
        iniciarSwipe();
    }
}

// O que acontece quando clica numa opção do Quiz
window.verificarResposta = function(btnIndex) {
    if (gameState.locked) return;
    gameState.locked = true; // Impede clicar duas vezes
    
    if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(20);

    const container = document.getElementById('quiz-options-container');
    container.classList.add('locked');

    let acertou = false;
    for (let i = 0; i < 3; i++) {
        let btn = document.getElementById(`btn-opt-${i}`);
        if (btn.dataset.correto === "true") {
            btn.classList.add('correct');
            // MÁGICA DOS PONTOS AQUI:
            if (i === btnIndex) {
                acertou = true;
                gameState.correct++; // Soma +1 aos acertos
            }
        } else if (i === btnIndex) {
            btn.classList.add('wrong');
        }
    }

    if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
        acertou ? navigator.vibrate([20, 50, 20]) : navigator.vibrate(100);
    }

    // Anima a carta saindo após 1.5s
    setTimeout(() => animarCartaSaindo(acertou ? 'right' : 'left'), 1500);
};

// --- Lógica de Swipe para Curiosidades ---
let startX = 0, currentX = 0, isDragging = false;

function iniciarSwipe() {
    const frontCard = document.querySelector('.card-front');
    if (!frontCard) return;

    // Função central que decide se a carta voa ou volta
    const finalizarArrasto = () => {
        if (!isDragging) return;
        isDragging = false;
        let diffX = currentX - startX;
        
        if (Math.abs(diffX) > 80) { // Se arrastou o suficiente pro lado
            animarCartaSaindo(diffX > 0 ? 'right' : 'left');
        } else { // Se arrastou pouco, devolve pro meio
            frontCard.style.transform = `scale(1) translateY(0)`;
        }
        startX = 0; currentX = 0; // Reseta as posições
    };

    // 1. Eventos de Toque (Celular)
    frontCard.addEventListener('touchstart', e => { startX = e.touches[0].clientX; currentX = startX; isDragging = true; }, {passive: true});
    frontCard.addEventListener('touchmove', e => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        let diffX = currentX - startX;
        frontCard.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
    }, {passive: true});
    frontCard.addEventListener('touchend', finalizarArrasto);

    // 2. Eventos de Mouse (Testes no Computador)
    frontCard.addEventListener('mousedown', e => { startX = e.clientX; currentX = startX; isDragging = true; frontCard.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        currentX = e.clientX;
        let diffX = currentX - startX;
        frontCard.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
    });
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            frontCard.style.cursor = 'grab';
            finalizarArrasto();
        }
    });
}

function animarCartaSaindo(direcao) {
    const frontCard = document.querySelector('.card-front');
    if (!frontCard) return;
    frontCard.classList.add(`swipe-out-${direcao}`);
    
    setTimeout(() => {
        gameState.index++;
        renderizarCartas();
    }, 350); // Tempo da carta voando pra fora
}

// Gerencia o Clique nas Abas/Filtros (Lógica Blindada)
document.querySelectorAll('#game-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const novoModo = btn.getAttribute('data-mode');
        
        // Se já estiver no modo que clicou, não faz nada. Se for novo, troca.
        if (gameState.mode !== novoModo) {
            document.querySelectorAll('#game-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            gameState.mode = novoModo;
            gameState.index = 0; // Reseta o progresso ao trocar de modo
            renderizarCartas();
        }
    });
});

// Inicializa a página
setTimeout(() => renderizarCartas(), 500);

// Função para zerar o game e voltar pra primeira carta
window.recomecarGame = function() {
    gameState.index = 0;
    gameState.correct = 0; // Zera a pontuação
    gameState.locked = false;
    renderizarCartas();
};

// =======================================================================
// --- SISTEMA UNIFICADO DE COLEÇÃO E PROGRESSO ---
// =======================================================================

// Banco de dados central das descobertas (Os IDs aqui casam com os nomes gerados pelo mapa)
const colecaoDados = [
    // ABELHAS
    { id: 'casa-de-abelha-1', titulo: 'Mirim', subtitulo: 'Plebeia droryana', cat: 'abelhas', img: 'assets/images/img-abelhas-droryana.webp' },
    { id: 'casa-de-abelha-2', titulo: 'Abelha-limão', subtitulo: 'Lestrimelitta limao', cat: 'abelhas', img: 'assets/images/img-abelhas-cxvazia.webp' },
    { id: 'casa-de-abelha-3', titulo: 'Iraí', subtitulo: 'Nannotrigona testaceicornis', cat: 'abelhas', img: 'assets/images/img-abelhas-irai.webp' },
    { id: 'casa-de-abelha-4', titulo: 'Mandaçaia', subtitulo: 'Melipona quadrifasciata', cat: 'abelhas', img: 'assets/images/img-abelhas-mandacaia.webp' },
    { id: 'casa-de-abelha-5', titulo: 'Guaraipo', subtitulo: 'Melipona bicolor', cat: 'abelhas', img: 'assets/images/img-abelhas-guaraipo.webp' },
    { id: 'casa-de-abelha-6', titulo: 'Uruçu', subtitulo: 'Melipona scutellaris', cat: 'abelhas', img: 'assets/images/trocarimagem.webp' },
    { id: 'casa-de-abelha-7', titulo: 'Marmelada-amarela', subtitulo: 'Frieseomelitta varia', cat: 'abelhas', img: 'assets/images/trocarimagem.webp' },
    { id: 'hotel-para-abelhas-solitárias', titulo: 'Hotel para Abelhas', subtitulo: 'Solitárias', cat: 'abelhas', img: 'assets/images/img-abelhas-hotel.webp' },
    { id: 'meliponário', titulo: 'Meliponário', subtitulo: 'Diversas nativas', cat: 'abelhas', img: 'assets/images/trocarimagem.webp' },

    // EXPOSIÇÕES
    { id: 'presépio-do-pipiripau', titulo: 'Presépio do Pipiripau', subtitulo: 'Exposição Histórica', cat: 'exposicoes', img: 'assets/images/img-expo-pipiripau-2.webp' },
    { id: 'orquídea', titulo: 'As fascinantes Orquídeas', subtitulo: 'Orquidário', cat: 'exposicoes', img: 'assets/images/img-expo-orquidario-2.webp' },
    { id: 'paleontologia', titulo: 'Paleontologia', subtitulo: 'Fósseis', cat: 'exposicoes', img: 'assets/images/trocarimagem.webp' },
    { id: 'botânica', titulo: 'Botânica', subtitulo: 'Mundo das Plantas', cat: 'exposicoes', img: 'assets/images/trocarimagem.webp' },
    { id: 'arqueologia', titulo: 'Arqueologia', subtitulo: 'Acervo Cultural', cat: 'exposicoes', img: 'assets/images/trocarimagem.webp' },
    { id: 'palacinho', titulo: 'Palacinho', subtitulo: 'Edificação Histórica', cat: 'exposicoes', img: 'assets/images/img-expo-palacinho.webp' },

    // OUTROS
    { id: 'jardim-de-plantas-medicinais', titulo: 'Jardim de Plantas Medicinais', subtitulo: 'Jardim', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'jardim-de-canga', titulo: 'Jardim de Canga', subtitulo: 'Jardim', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'jardim-sensorial', titulo: 'Jardim Sensorial', subtitulo: 'Jardim', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'jardim-de-plantas-tóxicas', titulo: 'Jardim de Plantas Tóxicas', subtitulo: 'Jardim', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'jardim-jurássico', titulo: 'Jardim Jurássico', subtitulo: 'Jardim', cat: 'outros', img: 'assets/images/img-jardim-jurassico.webp' },
    { id: 'dinossauro', titulo: 'Dinossauro Triceratops', subtitulo: 'Réplica', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'centro-de-visitantes', titulo: 'Centro de Visitantes', subtitulo: 'Informações', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'cantina', titulo: 'Cantina', subtitulo: 'Alimentação', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'anfiteatro-da-arqueologia', titulo: 'Anfiteatro da Arqueologia', subtitulo: 'Espaço', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'mirante-da-lagoa', titulo: 'Mirante da Lagoa', subtitulo: 'Contemplação', cat: 'outros', img: 'assets/images/img-outros-lagoa.webp' },
    { id: 'jogos-educativos', titulo: 'Jogos Educativos', subtitulo: 'Lazer', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'parquinho', titulo: 'Parquinho', subtitulo: 'Lazer Infantil', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'largo-da-barriguda', titulo: 'Largo da Barriguda', subtitulo: 'Convivência', cat: 'outros', img: 'assets/images/trocarimagem.webp' },
    { id: 'anfiteatro-da-mata', titulo: 'Anfiteatro da Mata', subtitulo: 'Espaço', cat: 'outros', img: 'assets/images/trocarimagem.webp' }
];

let filtroAtualColecao = 'todos';

// Ouve o clique nas abas (Filtros) da coleção
document.querySelectorAll('#colecao-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#colecao-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtualColecao = btn.getAttribute('data-filter');
        renderizarColecao();
    });
});

window.renderizarColecao = function() {
    const grid = document.getElementById('colecao-grid');
    if (!grid) return;

    let itemsVisiveis = colecaoDados;
    if (filtroAtualColecao !== 'todos') {
        itemsVisiveis = colecaoDados.filter(item => item.cat === filtroAtualColecao);
    }

    let htmlCards = '';
    let descobertosNoFiltroAtual = 0;

    itemsVisiveis.forEach(item => {
        const isVisited = localStorage.getItem(`poi_visited_${item.id}`) === 'true';
        if (isVisited) descobertosNoFiltroAtual++;

        const classeVisitado = isVisited ? 'visited' : '';
        const iconeBtn = isVisited ? '<i class="bi bi-check-lg"></i>' : '<i class="bi bi-circle"></i>';

        htmlCards += `
            <div class="colecao-card ${classeVisitado}" onclick="togglePoiVisitGlobal('${item.id}')">
                <img src="${item.img}" class="colecao-card-img" alt="${item.titulo}">
                <div class="colecao-card-info">
                    <span class="colecao-card-title">${item.titulo}</span>
                    <span class="colecao-card-sub">${item.subtitulo}</span>
                </div>
                <div class="colecao-toggle-btn">
                    ${iconeBtn}
                </div>
            </div>
        `;
    });

    grid.innerHTML = htmlCards;

    // Atualiza a Barra/Círculo de Progresso no topo da coleção
    const total = itemsVisiveis.length;
    const porcentagem = total === 0 ? 0 : Math.round((descobertosNoFiltroAtual / total) * 100);
    
    const lang = localStorage.getItem('beezita_lang') || 'pt';
    const txtDe = dicionario[lang].col_of || "de";
    const txtDesc = dicionario[lang].col_discovered || "descobertos";
    document.getElementById('colecao-count-text').innerText = `${descobertosNoFiltroAtual} ${txtDe} ${total} ${txtDesc}`;
    document.getElementById('colecao-circle').style.background = `conic-gradient(var(--honey-yellow) ${porcentagem}%, rgba(255,255,255,0.05) 0)`;
    document.getElementById('colecao-circle').innerHTML = `<span>${porcentagem}%</span>`;
}

// Inicializa a coleção quando o app abre
setTimeout(() => renderizarColecao(), 500);

// Uma função unificada para ligar/desligar o status (usada pelo mapa e pela coleção)
window.togglePoiVisitGlobal = function(safeName) {
    const storageKey = `poi_visited_${safeName}`;
    let isVisited = localStorage.getItem(storageKey) === 'true';
    
    if (isVisited) {
        localStorage.removeItem(storageKey);
    } else {
        localStorage.setItem(storageKey, 'true');
    }
    
    if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(30);

    // Atualiza a coleção e o mapa se estiver aberto
    renderizarColecao();
    
    // Atualiza o botão caso o popup do mapa esteja aberto agorinha
    const btnNoMapa = document.querySelector(`.poi-visit-btn[onclick*="${safeName}"]`);
    if (btnNoMapa) {
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        if (!isVisited) { // Se não estava, agora está
            btnNoMapa.classList.add('visited');
            btnNoMapa.innerHTML = `<span data-i18n="poi_visited">${dicionario[lang].poi_visited || "Visitado"}</span> <i class="bi bi-check-lg"></i>`;
        } else {
            btnNoMapa.classList.remove('visited');
            btnNoMapa.innerHTML = `<span data-i18n="poi_mark_visited">${dicionario[lang].poi_mark_visited || "Marcar como visitado"}</span>`;
        }
    }
};

// =======================================================================
// --- MOTOR DE INSTALAÇÃO PWA (PROGRESSIVE WEB APP) ---
// =======================================================================
let promptInstalacao;
const botaoInstalar = document.getElementById('btn-install-pwa');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    promptInstalacao = e; 
    if (botaoInstalar) botaoInstalar.style.display = 'flex'; 
});

if (botaoInstalar) {
    botaoInstalar.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (typeof toggleMenu === 'function' && isMenuOpen) {
            toggleMenu();
        }

        if (promptInstalacao) {
            promptInstalacao.prompt(); 
            const { outcome } = await promptInstalacao.userChoice;
            if (outcome === 'accepted') {
                botaoInstalar.style.display = 'none'; 
            }
            promptInstalacao = null;
        }
    });
}

// --- MOTOR DE INSTALAÇÃO E ATUALIZAÇÃO DO PWA MALHADO ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                // Escuta se uma nova versão do sw.js foi encontrada no GitHub
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Quando a nova versão terminar de instalar e o app já estiver sob controle anterior
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Dispara um aviso ou recarrega a página na hora para aplicar o novo código
                            mostrarToastAviso("Nova atualização aplicada com sucesso!");
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    });
                });
            })
            .catch(err => console.log('Falha no SW:', err));
    });
}

// =======================================================================
// --- MOTOR DE CLIMA EM TEMPO REAL (OPEN-METEO) ---
// =======================================================================
async function atualizarClimaMHNJB() {
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    if (!iconEl || !tempEl) return;

    // 1. VERIFICAÇÃO INSTANTÂNEA DE INTERNET
    if (!navigator.onLine) {
        const isSpinning = iconEl.classList.contains('weather-icon-spinning');
        iconEl.className = `bi bi-cloud-slash${isSpinning ? ' weather-icon-spinning' : ''}`;
        tempEl.innerText = "--°";
        return; // Aborta a função aqui, não gasta bateria tentando buscar na rede
    }

    try {
        // Pega as coordenadas exatas do museu
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-19.8935&longitude=-43.9135&current_weather=true');
        const data = await response.json();
        
        // Proteção extra caso a API do ServiceWorker retorne o fallback vazio
        if (!data || !data.current_weather || data.current_weather.temperature === "--") {
            throw new Error("Dados de clima inválidos");
        }
        
        const clima = data.current_weather;

        // Atualiza temperatura
        tempEl.innerText = `${Math.round(clima.temperature)}°`;

        // Traduz o código do tempo para um ícone bonito do Bootstrap
        let icone = 'bi-cloud-sun'; // Padrão
        const code = clima.weathercode;

        if (code === 0) icone = 'bi-sun-fill'; // Limpo
        else if (code === 1 || code === 2 || code === 3) icone = 'bi-clouds-fill'; // Nublado
        else if (code === 45 || code === 48) icone = 'bi-cloud-fog2-fill'; // Neblina
        else if (code >= 51 && code <= 67) icone = 'bi-cloud-rain-fill'; // Chuva/Garoa
        else if (code >= 80 && code <= 82) icone = 'bi-cloud-rain-heavy-fill'; // Chuva forte
        else if (code >= 95) icone = 'bi-cloud-lightning-rain-fill'; // Tempestade

        // Mantém a classe de giro (caso o usuário tenha clicado) e atualiza o ícone
        const isSpinning = iconEl.classList.contains('weather-icon-spinning');
        iconEl.className = `bi ${icone}${isSpinning ? ' weather-icon-spinning' : ''}`;

    } catch (error) {
        console.warn("Erro ao buscar clima:", error);
        // Falhou na rede ou API caiu: Mostra o ícone de sem conexão
        const isSpinning = iconEl.classList.contains('weather-icon-spinning');
        iconEl.className = `bi bi-cloud-slash${isSpinning ? ' weather-icon-spinning' : ''}`;
        tempEl.innerText = "--°";
    }
}

// Roda a primeira vez e depois atualiza automaticamente a cada 15 minutos
atualizarClimaMHNJB();
setInterval(atualizarClimaMHNJB, 900000);

// OUVIDOS DINÂMICOS: Se a pessoa perder ou recuperar o sinal de operadora/Wi-Fi andando pelo museu, o ícone muda sozinho na hora
window.addEventListener('offline', atualizarClimaMHNJB);
window.addEventListener('online', atualizarClimaMHNJB);

// --- LÓGICA DE ATUALIZAÇÃO MANUAL AO CLICAR ---
const weatherWidget = document.getElementById('weather-widget');
if (weatherWidget) {
    weatherWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Dá um "tec" de vibração se estiver ativado
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(20);
        
        const iconEl = document.getElementById('weather-icon');
        if (iconEl) {
            // Remove a classe e dá um "reflow" para permitir que a animação rode de novo se clicar rápido
            iconEl.classList.remove('weather-icon-spinning');
            void iconEl.offsetWidth; 
            
            // Adiciona o giro
            iconEl.classList.add('weather-icon-spinning');
            
            // Bate na API para puxar o clima exato deste segundo
            atualizarClimaMHNJB();
            
            // Tira a classe depois que a animação termina (0.6 segundos)
            setTimeout(() => {
                iconEl.classList.remove('weather-icon-spinning');
            }, 600);
        }
    });
}

// =======================================================================
// --- SISTEMA DE DOWNLOAD DE MAPA OFFLINE ---
// =======================================================================

// Converte Coordenadas em "Tile XYZ" (A fórmula matemática que os mapas usam)
function latLngToTile(lat, lng, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, z: zoom };
}

async function baixarMapaOffline() {
    const btn = document.getElementById('btn-download-mapa');
    const icone = document.getElementById('icone-download-mapa');
    const barra = document.getElementById('barra-progresso-download');
    const statusTxt = document.getElementById('status-mapa-offline');
    
    if (!btn || btn.classList.contains('downloading')) return;
    
    if (!navigator.onLine) {
        mostrarToastAviso("Você precisa de internet para baixar o mapa pela primeira vez.");
        return;
    }

    btn.classList.add('downloading');
    icone.className = 'bi bi-arrow-repeat weather-icon-spinning'; // Gira o icone
    barra.style.display = 'block';
    barra.style.width = '0%';
    statusTxt.style.display = 'block';
    statusTxt.innerText = '0%';

    // Limites EXATOS da área do Museu MHNJB
    const boundNW = { lat: -19.8850, lng: -43.9220 };
    const boundSE = { lat: -19.8980, lng: -43.9100 };
    const niveisDeZoom = [16, 17, 18, 19];
    
    const urlsParaBaixar = [];
    const token = 'pk.eyJ1Ijoid2lsc2kyNDQiLCJhIjoiY21wNzB0Mjh4MDF2aDJwcHRucnEzbW9sMyJ9.E8maQPtBHhWt4-TNZXt--w';
    
    // Precisamos baixar os dois temas (claro e escuro) para que o offline funcione nos dois modos
    const urlDark = 'https://api.mapbox.com/styles/v1/wilsi244/cmpbsrijn007n01s1exze9lik/tiles/256';
    const urlLight = 'https://api.mapbox.com/styles/v1/wilsi244/cmpbcbsdq001801ry1ipk8ida/tiles/256';

    niveisDeZoom.forEach(zoom => {
        const tileNW = latLngToTile(boundNW.lat, boundNW.lng, zoom);
        const tileSE = latLngToTile(boundSE.lat, boundSE.lng, zoom);
        
        for (let x = tileNW.x; x <= tileSE.x; x++) {
            for (let y = tileNW.y; y <= tileSE.y; y++) {
                urlsParaBaixar.push(`${urlDark}/${zoom}/${x}/${y}@2x?access_token=${token}`);
                urlsParaBaixar.push(`${urlLight}/${zoom}/${x}/${y}@2x?access_token=${token}`);
            }
        }
    });

    const totalArquivos = urlsParaBaixar.length;
    let baixados = 0;

    // Abre o Cache do Service Worker
    const cache = await caches.open('beezita-map-tiles-v1');

    // Faz o download em lotes de 10 simultâneos para não travar o celular
    const limitador = 10;
    for (let i = 0; i < totalArquivos; i += limitador) {
        const lote = urlsParaBaixar.slice(i, i + limitador);
        
        await Promise.all(lote.map(async (url) => {
            try {
                // Checa se já existe. Se não existir, baixa.
                const resposta = await cache.match(url);
                if (!resposta) {
                    const requisicao = new Request(url, { mode: 'cors' });
                    const res = await fetch(requisicao);
                    if (res.ok) await cache.put(requisicao, res);
                }
            } catch (err) {
                console.warn("Falha ao baixar tile:", url);
            } finally {
                baixados++;
                let porcentagem = Math.round((baixados / totalArquivos) * 100);
                barra.style.width = `${porcentagem}%`;
                statusTxt.innerText = `${porcentagem}%`;
            }
        }));
    }

// Finaliza o Download
    // Finaliza o Download
    setTimeout(() => {
        btn.classList.remove('downloading');
        icone.className = 'bi bi-check-circle-fill';
        icone.style.color = 'var(--honey-yellow)';
        barra.style.display = 'none';
        
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        statusTxt.innerText = dicionario[lang].set_delete || "EXCLUIR";
        statusTxt.setAttribute('data-i18n', 'set_delete');
        
        // MÁGICA: Muda o texto principal para "Mapa Offline Baixado"
        const spanTextoMapa = document.querySelector('#btn-download-mapa .text');
        if (spanTextoMapa) {
            spanTextoMapa.setAttribute('data-i18n', 'set_offline_map_done');
            spanTextoMapa.innerText = dicionario[lang].set_offline_map_done || "Mapa Offline Baixado";
        }
        
        localStorage.setItem('beezita_mapa_offline', 'true');
        
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    }, 500);
}

// NOVA FUNÇÃO: DELETA OS DADOS OFFLINE
async function excluirMapaOffline() {
    // Exclui a pasta do cache no navegador
    if ('caches' in window) {
        await caches.delete('beezita-map-tiles-v1');
    }
    // Remove da memória
    localStorage.removeItem('beezita_mapa_offline');
    
    // Volta a interface ao estado original (Pronto para baixar de novo)
    const icone = document.getElementById('icone-download-mapa');
    const statusTxt = document.getElementById('status-mapa-offline');
    const spanTextoMapa = document.querySelector('#btn-download-mapa .text');
    const lang = localStorage.getItem('beezita_lang') || 'pt';
    
    if (icone) {
        icone.className = 'bi bi-cloud-arrow-down';
        icone.style.color = ''; // Tira o amarelo, volta pra cor do tema
    }
    if (statusTxt) {
        statusTxt.style.display = 'none';
        statusTxt.removeAttribute('data-i18n');
    }
    
    // MÁGICA: Devolve o texto para "Baixar Mapa Offline"
    if (spanTextoMapa) {
        spanTextoMapa.setAttribute('data-i18n', 'set_offline_map');
        spanTextoMapa.innerText = dicionario[lang].set_offline_map || "Baixar Mapa Offline";
    }
    
    mostrarToastAviso("Mapa offline removido do aparelho.");
    if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// LÓGICA DO CLIQUE: INTERRUPTOR INTELIGENTE
const btnDownload = document.getElementById('btn-download-mapa');
if (btnDownload) {
    btnDownload.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Se já está baixado, a ação do botão vira "Excluir". Se não, vira "Baixar".
        if (localStorage.getItem('beezita_mapa_offline') === 'true') {
            excluirMapaOffline();
        } else {
            baixarMapaOffline();
        }
    });
    
    // Verifica ao abrir o app se já havia baixado antes, para deixar a interface pronta
    if (localStorage.getItem('beezita_mapa_offline') === 'true') {
        const icone = document.getElementById('icone-download-mapa');
        const statusTxt = document.getElementById('status-mapa-offline');
        const spanTextoMapa = document.querySelector('#btn-download-mapa .text');
        const lang = localStorage.getItem('beezita_lang') || 'pt';
        
        if (icone) {
            icone.className = 'bi bi-check-circle-fill';
            icone.style.color = 'var(--honey-yellow)';
        }
        if (statusTxt) {
            statusTxt.style.display = 'block';
            statusTxt.setAttribute('data-i18n', 'set_delete');
            statusTxt.innerText = dicionario[lang].set_delete || "EXCLUIR";
        }
        
        // MÁGICA: Ao abrir o app, já carrega com o nome correto
        if (spanTextoMapa) {
            spanTextoMapa.setAttribute('data-i18n', 'set_offline_map_done');
            spanTextoMapa.innerText = dicionario[lang].set_offline_map_done || "Mapa Offline Baixado";
        }
    }
}

// --- LÓGICA DO AVISO DE PRESERVAÇÃO COM TEMPORIZADOR ---
const avisoPreservacao = document.getElementById('aviso-preservacao');
const btnFecharAviso = document.getElementById('btn-fechar-aviso-preservacao');
const textoTimerAviso = document.getElementById('preservation-timer-text');
let timerPreservacaoId = null;

window.exibirAvisoPreservacao = function() {
    if (!avisoPreservacao || !textoTimerAviso) return;

    // Limpa qualquer timer antigo antes de começar um novo
    if (timerPreservacaoId) clearInterval(timerPreservacaoId);
    
    // Esconde a pílula de clima/camadas suavemente
    document.body.classList.add('aviso-ativo');
    
    // Exibe o aviso
    avisoPreservacao.classList.remove('hidden');
    
    let tempoRestante = 15;
    textoTimerAviso.innerText = tempoRestante + 's';
    
    timerPreservacaoId = setInterval(() => {
        tempoRestante--;
        textoTimerAviso.innerText = tempoRestante + 's';
        
        if (tempoRestante <= 0) {
            window.fecharAvisoPreservacao();
        }
    }, 1000);
};

window.fecharAvisoPreservacao = function() {
    if (timerPreservacaoId) clearInterval(timerPreservacaoId);
    if (avisoPreservacao) avisoPreservacao.classList.add('hidden');
    
    // Remove a classe do body, fazendo a pílula de clima/camadas voltar
    document.body.classList.remove('aviso-ativo');
};

if (btnFecharAviso) {
    btnFecharAviso.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof isHapticEnabled !== 'undefined' && isHapticEnabled && navigator.vibrate) navigator.vibrate(20);
        window.fecharAvisoPreservacao();
    });
}

// --- EVENTOS E MÉTRICAS DE INSTALAÇÃO DO PWA ---
window.addEventListener('appinstalled', (e) => {
    // AVISO AO CONTADOR: Registra que o aplicativo foi instalado com sucesso
    if (window.goatcounter) {
        window.goatcounter.count({ path: 'pwa-instalado-sucesso', event: true });
    }
});
