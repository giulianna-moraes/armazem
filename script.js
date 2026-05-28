// Marcas amarradas de forma fixa por ruas do galpão
const marcasPorRua = {
    "R1": { nome: "EPSON", classeCor: "border-rose-500 ring-4 ring-rose-500/20 bg-rose-950/10" },
    "R2": { nome: "LG", classeCor: "border-amber-500 ring-4 ring-amber-500/20 bg-amber-950/10" },
    "R3": { nome: "SAMSUNG", classeCor: "border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-950/10" },
    "R4": { nome: "HP", classeCor: "border-blue-500 ring-4 ring-blue-500/20 bg-blue-950/10" }
};

// Renderiza o almoxarifado criando IDs únicos em cada gavetinha (Ex: cell-R1-IMP-A-andar-3)
function renderWarehouse() {
    const ruas = ['R1', 'R2', 'R3', 'R4'];
    
    // Setor de Impressoras (A e B)
    ruas.forEach(rua => {
        ['A', 'B'].forEach(prat => {
            const container = document.getElementById(`${rua}-IMP-${prat}`);
            if (container) container.appendChild(createShelfGrid(rua, "IMP", prat));
        });
    });

    // Setor de Computadores (C e D)
    ruas.forEach(rua => {
        ['C', 'D'].forEach(prat => {
            const container = document.getElementById(`${rua}-COMP-${prat}`);
            if (container) container.appendChild(createShelfGrid(rua, "COMP", prat));
        });
    });
}

function createShelfGrid(rua, setor, prat) {
    const moduloPrat = document.createElement('div');
    moduloPrat.className = "bg-slate-900 border border-slate-800/80 p-1.5 rounded-xl w-full text-center static-shelf-box shadow-inner";
    
    const aptGrid = document.createElement('div');
    aptGrid.className = "grid grid-cols-6 gap-1"; 

    // Mapeamento dos apartamentos/andares (1 a 6)
    for (let a = 1; a <= 6; a++) {
        const aptDiv = document.createElement('div');
        // O ID carrega o endereço exato para podermos pescá-lo na busca por código
        aptDiv.id = `cell-${rua}-${setor}-${prat}-andar-${a}`;
        aptDiv.className = "h-5 bg-slate-950 border border-slate-800/30 rounded-[3px] text-[8px] text-slate-600 font-black flex items-center justify-center transition-all duration-300";
        aptDiv.innerHTML = `<span>0${a}</span>`;
        aptGrid.appendChild(aptDiv);
    }
    
    moduloPrat.appendChild(aptGrid);
    return moduloPrat;
}

// Mecanismo de Busca Inteligente Híbrida (Diferencia Marca de Código Logístico)
const searchInput = document.getElementById('search');
const suggestionsDiv = document.getElementById('suggestions');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toUpperCase().trim();
    suggestionsDiv.innerHTML = '';
    
    if (query.length === 0) {
        suggestionsDiv.classList.add('hidden');
        return;
    }

    // RegEx para detectar se o usuário está digitando um padrão de código (Ex: R1-B1-A-3)
    const regexCodigo = /^R[1-4]-B[1-2]-[A-D](-[1-6])?$/;
    
    if (regexCodigo.test(query) || query.startsWith("R")) {
        // Se parece um código, cria a sugestão de rota direta por endereço
        renderCodigoSuggestion(query);
    } else {
        // Senão, faz a busca tradicional por texto de marca
        renderMarcaSuggestions(query);
    }
});

function renderCodigoSuggestion(query) {
    // Quebra as partes digitadas para validar
    const partes = query.split('-');
    const rua = partes[0];
    const bloco = partes[1] || "B1";
    const prat = partes[2] || "A";
    const andar = partes[3] || "1";

    const setor = (prat === "A" || prat === "B") ? "IMPRESSORAS" : "COMPUTADORES";
    const marcaAlvo = marcasPorRua[rua] ? marcasPorRua[rua].nome : "MULTIMARCA";

    const item = document.createElement('div');
    item.className = "px-4 py-2.5 hover:bg-slate-800 border-b border-slate-950 cursor-pointer text-xs flex justify-between items-center bg-indigo-950/20";
    item.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid fa-barcode text-emerald-400"></i>
            <span class="font-bold text-white">Ir para Endereço: ${query}</span>
        </div>
        <span class="text-[9px] opacity-70 bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">${marcaAlvo}</span>
    `;
    item.onclick = () => {
        executeBuscaPorCodigo(rua, bloco, prat, andar, marcaAlvo, setor);
        searchInput.value = query;
        suggestionsDiv.classList.add('hidden');
    };
    suggestionsDiv.appendChild(item);
    suggestionsDiv.classList.remove('hidden');
}

function renderMarcaSuggestions(query) {
    const setoresMapeados = ["IMPRESSORAS", "COMPUTADORES"];
    let matches = [];

    Object.keys(marcasPorRua).forEach(key => {
        const m = marcasPorRua[key];
        if (m.nome.includes(query)) {
            setoresMapeados.forEach(s => {
                matches.push({ marca: m.nome, setor: s, rua: key });
            });
        }
    });

    if (matches.length > 0) {
        matches.forEach(itemMatch => {
            const item = document.createElement('div');
            item.className = "px-4 py-2.5 hover:bg-slate-800 border-b border-slate-950 cursor-pointer text-xs flex justify-between items-center transition-colors";
            const icone = itemMatch.setor === "IMPRESSORAS" ? "fa-print text-indigo-400" : "fa-desktop text-teal-400";
            
            item.innerHTML = `
                <div class="flex items-center gap-2">
                    <i class="fa-solid ${icone} w-4"></i>
                    <span class="font-bold text-white">${itemMatch.marca}</span>
                    <span class="text-[10px] text-slate-400 font-medium">(${itemMatch.setor.toLowerCase()})</span>
                </div>
                <span class="text-[9px] font-mono opacity-60 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">${itemMatch.rua}</span>
            `;
            item.onclick = () => {
                selectContornoEstrutura(itemMatch.marca, itemMatch.setor, itemMatch.rua);
                searchInput.value = `${itemMatch.marca} (${itemMatch.setor.toLowerCase()})`;
                suggestionsDiv.classList.add('hidden');
            };
            suggestionsDiv.appendChild(item);
        });
        suggestionsDiv.classList.remove('hidden');
    } else {
        suggestionsDiv.innerHTML = `<div class="p-2.5 text-xs text-slate-500 text-center">Nenhum resultado encontrado</div>`;
        suggestionsDiv.classList.remove('hidden');
    }
}

// BUSCA AVANÇADA POR CÓDIGO - Encontra o andar exato e faz piscar!
function executeBuscaPorCodigo(rua, bloco, prat, andar, marca, setor) {
    clearSelection();

    document.getElementById('info-empty').classList.add('hidden');
    const content = document.getElementById('info-content');
    content.classList.remove('hidden');

    document.getElementById('tipo-busca-tag').innerText = "CÓDIGO LOGÍSTICO";
    document.getElementById('tipo-busca-tag').className = "text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-lg";

    document.getElementById('prod-nome').innerText = `${marca} (${setor.toLowerCase()})`;
    document.getElementById('lbl-rua').innerText = rua;
    document.getElementById('lbl-bloco').innerText = bloco;
    document.getElementById('lbl-prat').innerText = prat;
    document.getElementById('lbl-andar').innerText = `${andar}º Andar`;
    document.getElementById('lbl-apt').innerText = `0${andar}`;
    document.getElementById('addr-completo').innerText = `${rua}-${bloco}-${prat}-${andar}`;

    const steps = [
        `Código validado! Dirija-se imediatamente até a <strong class="text-indigo-400">Rua ${rua}</strong>.`,
        `Localize o <strong class="text-white">${bloco === 'B1' ? 'Bloco 1' : 'Bloco 2'}</strong> na prateleira <strong class="text-indigo-300">Lado ${prat}</strong>.`,
        `Colete o produto piscando no mapa, situado no <strong class="text-emerald-400">${andar}º nível (andar)</strong>.`
    ];
    document.getElementById('route-steps').innerHTML = steps.map(step => `<li>${step}</li>`).join('');

    // Liga os efeitos macro na rua desejada
    const areaRua = document.getElementById(`area-${rua}`);
    if (areaRua) areaRua.className += " border-indigo-500/30 bg-indigo-950/10";
    const setaRua = document.getElementById(`arrow-${rua}`);
    if (setaRua) setaRua.classList.remove('hidden');

    // Aplica o contorno unificado na estrutura correspondente
    const siglaSetor = (prat === "A" || prat === "B") ? "IMP" : "COMP";
    const estruturaAlvo = document.getElementById(`shelf-${rua}-${siglaSetor}`);
    if (estruturaAlvo && marcasPorRua[rua]) {
        estruturaAlvo.className = `grid grid-cols-2 gap-3 p-1 rounded-xl border-2 transition-all duration-300 ${marcasPorRua[rua].classeCor} shadow-2xl scale-[1.01] z-10`;
    }

    // PINPOINT: Captura a célula exata e injeta a classe de animação neon!
    const celulaExata = document.getElementById(`cell-${rua}-${siglaSetor}-${prat}-andar-${andar}`);
    if (celulaExata) {
        celulaExata.classList.add('exact-target-blink');
    }
}

// BUSCA TRADICIONAL POR MARCA (Mesmo comportamento consolidado anterior)
function selectContornoEstrutura(marca, setor, rua) {
    clearSelection();

    document.getElementById('info-empty').classList.add('hidden');
    const content = document.getElementById('info-content');
    content.classList.remove('hidden');

    document.getElementById('tipo-busca-tag').innerText = "ENDEREÇO MACRO";
    document.getElementById('tipo-busca-tag').className = "text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-lg";

    document.getElementById('prod-nome').innerText = marca;
    document.getElementById('lbl-rua').innerText = rua;
    document.getElementById('lbl-bloco').innerText = "Todos";
    
    const badge = document.getElementById('prod-badge');
    badge.innerText = setor;
    badge.className = `text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${setor === 'IMPRESSORAS' ? 'bg-indigo-600' : 'bg-teal-600'}`;

    const siglaSetor = setor === "IMPRESSORAS" ? "IMP" : "COMP";
    const letrasPrat = setor === "IMPRESSORAS" ? "A e B" : "C e D";
    document.getElementById('lbl-prat').innerText = letrasPrat;
    document.getElementById('lbl-andar').innerText = "1º ao 4º";
    document.getElementById('lbl-apt').innerText = "01 ao 06";
    document.getElementById('addr-completo').innerText = `${rua}-${siglaSetor}-${letrasPrat} (COMPLETO)`;

    const steps = [
        `Entre no galpão seguindo as setas direcionais de fluxo.`,
        `Siga direto pelo corredor central e converta na <strong class="text-indigo-400">Rua ${rua}</strong>.`,
        `Toda a estrutura de prateleiras (<strong class="text-indigo-300">Lados ${letrasPrat}</strong>) deste bloco pertence à marca <strong class="text-white">${marca}</strong>.`
    ];
    document.getElementById('route-steps').innerHTML = steps.map(step => `<li>${step}</li>`).join('');

    const areaRua = document.getElementById(`area-${rua}`);
    if (areaRua) areaRua.className += " border-indigo-500/30 bg-indigo-950/10";
    const setaRua = document.getElementById(`arrow-${rua}`);
    if (setaRua) setaRua.classList.remove('hidden');

    const estruturaAlvo = document.getElementById(`shelf-${rua}-${siglaSetor}`);
    if (estruturaAlvo) {
        estruturaAlvo.className = `grid grid-cols-2 gap-3 p-1 rounded-xl border-2 transition-all duration-300 ${marcasPorRua[rua].classeCor} shadow-2xl scale-[1.01] z-10`;
    }
}

function clearSelection() {
    document.getElementById('info-content').classList.add('hidden');
    document.getElementById('info-empty').classList.remove('hidden');
    
    // Remove os blinks de alvo exato de todas as células do mapa
    const celulas = document.querySelectorAll('.exact-target-blink');
    celulas.forEach(c => c.classList.remove('exact-target-blink'));

    ['R1', 'R2', 'R3', 'R4'].forEach(rua => {
        const area = document.getElementById(`area-${rua}`);
        if(area) area.className = "relative corridor-row border-slate-800/50 bg-slate-950/10";
        const seta = document.getElementById(`arrow-${rua}`);
        if (seta) seta.classList.add('hidden');
        
        ['IMP', 'COMP'].forEach(setor => {
            const shelf = document.getElementById(`shelf-${rua}-${setor}`);
            if (shelf) {
                shelf.className = "grid grid-cols-2 gap-3 transition-all duration-300 p-1 rounded-xl border-2 border-transparent";
            }
        });
    });
}

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.add('hidden');
    }
});

window.onload = renderWarehouse;