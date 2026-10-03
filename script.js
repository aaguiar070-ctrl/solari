// ==========================================
// 1. VARIAÇÕES DE CORES PADRÃO
// ==========================================

// Para peças Silver: Rosa, Crystal, Verde e Fúcsia
const variacoesSilver = [
    { nome: "Rosa", cor: "#ffb6c1", esgotado: false },
    { nome: "Crystal", cor: "#ffffff", esgotado: false },
    { nome: "Verde", cor: "#6b8e23", esgotado: false },
    { nome: "Fúcsia", cor: "#d6006e", esgotado: false }
];

// Para peças Douradas / Outras: Crystal, Rosa e Fúcsia
const variacoesDourado = [
    { nome: "Crystal", cor: "#ffffff", esgotado: false },
    { nome: "Rosa", cor: "#ffb6c1", esgotado: false },
    { nome: "Fúcsia", cor: "#d6006e", esgotado: false }
];

// Armazena as quantidades selecionadas em tempo real na janela aberta
let quantidadesAtuais = {};

// ==========================================
// 2. NAVEGAÇÃO E MENU MOBILE
// ==========================================

function toggleMenu() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.toggle('open');
    }
}

function filtrarColecao(nomeColecao, botao) {
    const colecoes = document.querySelectorAll('.collection');
    const botoes = document.querySelectorAll('.collection-menu button');

    botoes.forEach(b => b.classList.remove('active'));
    if (botao) botao.classList.add('active');

    colecoes.forEach(col => {
        if (nomeColecao === 'todas' || col.id === nomeColecao) {
            col.classList.add('active');
        } else {
            col.classList.remove('active');
        }
    });
}

// ==========================================
// 3. AUXILIARES E FORMATADORES
// ==========================================

function nomeDaImagem(nome) {
    return nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

// ==========================================
// 4. DETALHES DO PRODUTO (MODAL)
// ==========================================

function abrirDetalhes(produto) {
    quantidadesAtuais = {};

    const nomeArquivo = nomeDaImagem(produto.nome);
    const imagemPrincipal = `images/${nomeArquivo}.jpeg`;
    const imagemSecundaria = `images/${nomeArquivo}-2.jpeg`;

    // 1. Identifica as variações (Silver vs Dourado)
    let listaVariacoes = produto.variacoes;

    if (!listaVariacoes) {
        const nomeUpper = produto.nome.toUpperCase();
        const colecaoUpper = (produto.colecao || "").toUpperCase();

        if (nomeUpper.includes("SILVER") || colecaoUpper.includes("SILVER")) {
            listaVariacoes = variacoesSilver;
        } else {
            listaVariacoes = variacoesDourado;
        }
    }

    // 2. Prepara o modal no HTML
    let modal = document.getElementById('product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'product-modal';
        document.body.appendChild(modal);
    }

    // 3. Constrói o HTML das variações
    let variacoesHTML = '<div class="variacoes-container">';
    
    listaVariacoes.forEach((v, index) => {
        quantidadesAtuais[v.nome] = 0;

        const estiloSwatch = v.imagem 
            ? `background-image: url('${v.imagem}');` 
            : `background-color: ${v.cor || '#eee'};`;

        variacoesHTML += `
            <div class="variacao-row">
                <div class="variacao-swatch" style="${estiloSwatch}"></div>
                <div class="variacao-details">
                    <span class="variacao-label">${v.nome}</span>
                    ${v.esgotado ? `
                        <span class="btn-avise-me" onclick="aviseMe('${produto.nome}', '${v.nome}')">Avise-me quando chegar</span>
                    ` : `
                        <div class="qty-box">
                            <span class="qty-val" id="qty-${index}">0</span>
                            <div class="qty-controls">
                                <button type="button" class="qty-btn btn-minus" onclick="alterarQtd('${v.nome}',${index}, -1)">-</button>
                                <button type="button" class="qty-btn btn-plus" onclick="alterarQtd('${v.nome}',${index}, 1)">+</button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    });

    variacoesHTML += '</div>';

    // 4. Preenche a estrutura do modal
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="fecharDetalhes()">&times;</button>
            <h2>${produto.nome}</h2>
            
            <div class="modal-images">
                <img src="${imagemPrincipal}" alt="${produto.nome}" onerror="this.src='https://via.placeholder.com/300?text=SOLARI'">
                <img src="${imagemSecundaria}" alt="${produto.nome} - Vista 2" onerror="this.style.display='none'">
            </div>

            ${produto.precoAntigo ? `<p class="modal-old-price">De: R$ ${produto.precoAntigo}</p>` : ''}
            <p class="modal-price">R$ ${produto.preco}</p>

            ${variacoesHTML}

            <button class="btn" onclick="comprarWhatsApp('${produto.nome}', '${produto.preco}')">Pedir pelo WhatsApp</button>
        </div>
    `;

    modal.style.display = 'flex';
}

function fecharDetalhes() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==========================================
// 5. CONTROLE DE QUANTIDADE E WHATSAPP
// ==========================================

function alterarQtd(nomeVariacao, index, delta) {
    const atual = quantidadesAtuais[nomeVariacao] || 0;
    const novoValor = Math.max(0, atual + delta);
    
    quantidadesAtuais[nomeVariacao] = novoValor;
    
    const elQty = document.getElementById(`qty-${index}`);
    if (elQty) {
        elQty.textContent = novoValor;
    }
}

function comprarWhatsApp(nomeProduto, preco) {
    const itensSelecionados = [];
    
    for (const [cor, qtd] of Object.entries(quantidadesAtuais)) {
        if (qtd > 0) {
            itensSelecionados.push(`• ${cor}: ${qtd} un.`);
        }
    }

    let mensagem = `Olá! Gostaria de fazer um pedido na SOLARI:\n\n*${nomeProduto}* (R$ ${preco})\n`;

    if (itensSelecionados.length > 0) {
        mensagem += `\n*Opções Selecionadas:*\n` + itensSelecionados.join('\n');
    } else {
        mensagem += `\nGostaria de mais informações sobre este produto.`;
    }

    const numeroWhats = "12987019772"; // Substitua pelo seu número do WhatsApp com DDD
    const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

function aviseMe(nomeProduto, cor) {
    const mensagem = `Olá! Gostaria de ser avisada quando o produto *${nomeProduto}* na cor *${cor}* estiver disponível novamente.`;
    const numeroWhats = "12987019772"; // Substitua pelo seu número do WhatsApp com DDD
    const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

// Fecha o modal ao clicar fora da caixa branca
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        fecharDetalhes();
    }
};