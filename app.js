

/* =====================================================
   ROTABUS - APLICAÇÃO PRINCIPAL
   Carrega os dados de rotabus-horarios.json
===================================================== */

const DATA_URL = "./rotabus-horarios.json";
const app = document.getElementById("app");

let linhas = [];

const page = document.body.dataset.page || "home";

/* PROTEÇÃO DE TEXTO HTML */

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

/* FORMATAÇÃO DE DATA */

function formatDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return "Não informada";
  }

  const [year, month, day] = iso.split("-");

  return `${day}/${month}/${year}`;
}

/* DADOS DAS LINHAS */

function getDirections(line) {
  return line?.horarios?.timetable?.directions ?? [];
}

function getAllDepartures(line) {
  return getDirections(line).reduce((total, direction) =>
    total + (direction.services ?? []).reduce((sum, service) =>
      sum + (service.departures ?? []).length, 0), 0);
}

/* CARTÃO DE CADA LINHA */

function lineCard(line) {
  const directions = getDirections(line);

  return `
    <article class="line-card">

      <div class="line-card-top">
        <span class="line-number">
          ${escapeHTML(line.linha)}
        </span>

        <span class="muted small">
          ${directions.length} sentido(s)
        </span>
      </div>

      <h3>
        Linha ${escapeHTML(line.linha)} — ${escapeHTML(line.nome)}
      </h3>

      <p>
        ${getAllDepartures(line)} partida(s) cadastradas no arquivo.
      </p>

      <a class="text-link"
         href="horarios.html?linha=${encodeURIComponent(line.linha)}">
        Consultar horários →
      </a>

    </article>
  `;
}

/* CABEÇALHO DAS PÁGINAS */

function pageHeading(eyebrow, title, description) {
  return `
    <section class="page-heading">
      <div class="container">

        <span class="eyebrow">
          ${escapeHTML(eyebrow)}
        </span>

        <h1>${escapeHTML(title)}</h1>

        <p>${escapeHTML(description)}</p>

      </div>
    </section>
  `;
}

/* ERRO AO CARREGAR JSON */

function showLoadError(error) {
  app.innerHTML = `
    <section class="container section-space">

      <div class="alert alert-error">

        <strong>Não foi possível carregar os dados.</strong>

        <p>${escapeHTML(error.message)}</p>

        <p>
          Confirme se o arquivo
          <code>rotabus-horarios.json</code>
          está na mesma pasta dos arquivos HTML
          e abra o projeto com o Live Server.
        </p>

      </div>

    </section>
  `;
}

/* CARREGAMENTO DOS DADOS */

async function loadData() {
  try {

    const response = await fetch(DATA_URL, {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(
        `Erro HTTP ${response.status} ao abrir o JSON.`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "O JSON precisa conter uma lista de linhas."
      );
    }

    linhas = data.filter(item =>
      item && item.linha && item.horarios
    );

    linhas.sort((a, b) =>
      String(a.linha).localeCompare(
        String(b.linha),
        "pt-BR",
        { numeric: true }
      )
    );

    renderPage();

  } catch (error) {

    console.error(error);

    if (page === "map" || page === "about") {
      renderPage();
    } else {
      showLoadError(error);
    }
  }
}

/* SELEÇÃO DA PÁGINA */

function renderPage() {

  document.querySelectorAll("[data-nav]").forEach(link => {

    if (link.dataset.nav === page) {
      link.classList.add("active");
    }

  });

  if (page === "home") {
    renderHome();

  } else if (page === "lines") {
    renderLines();

  } else if (page === "schedules") {
    renderSchedules();

  } else if (page === "map") {
    renderMap();

  } else if (page === "about") {
    renderAbout();

  } else {
    renderHome();
  }
}

/* =========================================
   PÁGINA INICIAL
========================================= */

function renderHome() {

  const featured = linhas.slice(0, 6);

  app.innerHTML = `

    <section class="hero">

      <div class="container hero-grid">

        <div class="hero-copy">

          <span class="eyebrow eyebrow-light">
            TRANSPORTE PÚBLICO
          </span>

          <h1>Seu caminho começa aqui!</h1>

          <p>
            Consulte linhas e horários do transporte
            público de Santa Cruz do Sul em um só lugar.
          </p>

          <form class="search-panel" id="homeSearch">

            <label for="homeQuery">
              Pesquisar linha ou destino
            </label>

            <div class="search-row">

              <input
                id="homeQuery"
                type="search"
                placeholder="Ex.: 01 ou Agnes / Kaempf"
                autocomplete="off"
              >

              <button
                class="button button-primary"
                type="submit">
                Buscar
              </button>

            </div>

          </form>

          <div class="hero-hint">
            Pesquise pelo número ou pelo nome da linha.
          </div>

        </div>

        <div class="hero-visual home-map-visual" aria-label="Mapa de referência de Santa Cruz do Sul">
  <iframe
    class="home-map-iframe"
    title="Mapa de Santa Cruz do Sul"
    src="https://www.openstreetmap.org/export/embed.html?bbox=-52.46%2C-29.75%2C-52.37%2C-29.68&layer=mapnik"
    loading="lazy">
  </iframe>

  <div class="home-map-caption">
    <strong>MAPA ILUSTRATIVO</strong>
    <span>Referência visual de Santa Cruz do Sul</span>
    <a href="mapa.html">Abrir mapa completo →</a>
  </div>
</div>  

        </div>

      </div>

    </section>

    <section class="container section-space">

      <div class="section-title-row">

        <div>

          <span class="eyebrow">
            CONSULTA RÁPIDA
          </span>

          <h2>Linhas disponíveis</h2>

          <p>
            Escolha uma linha para ver os horários cadastrados.
          </p>

        </div>

        <a class="button button-outline" href="linhas.html">
          Ver todas as linhas
        </a>

      </div>

      <div class="line-grid">

        ${
          featured.map(lineCard).join("") ||
          "<p>Não há linhas carregadas.</p>"
        }

      </div>

      <div class="info-strip">
        <strong>Importante:</strong>
        os horários são lidos do arquivo de dados importado
        e podem ter datas de validade específicas.
        O RotaBus não realiza rastreamento GPS em tempo real.
      </div>

    </section>

    <section class="how-section">

      <div class="container">

        <span class="eyebrow">SIMPLES DE USAR</span>

        <h2>Como consultar sua linha</h2>

        <div class="steps-grid">

          <article>
            <span>01</span>
            <h3>Pesquise</h3>
            <p>Informe o número ou o nome da linha.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Escolha o sentido</h3>
            <p>Selecione a direção desejada para a viagem.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Confira os horários</h3>
            <p>Veja as partidas e chegadas disponíveis na tabela.</p>
          </article>

        </div>

      </div>

    </section>

  `;

  document.getElementById("homeSearch")
    .addEventListener("submit", event => {

      event.preventDefault();

      const query = document
        .getElementById("homeQuery")
        .value.trim();

      window.location.href =
        `linhas.html?q=${encodeURIComponent(query)}`;

    });
}

/* =========================================
   PÁGINA DE LINHAS
========================================= */

function renderLines() {

  const query =
    new URLSearchParams(window.location.search).get("q") || "";

  app.innerHTML = `

    ${pageHeading(
      "TRANSPORTE PÚBLICO",
      "Linhas de ônibus",
      "Pesquise uma linha e consulte as informações disponíveis."
    )}

    <section class="container section-space">

      <form id="lineSearch"
            class="search-panel search-panel-light">

        <label for="lineQuery">
          Buscar por número ou destino
        </label>

        <div class="search-row">

          <input
            id="lineQuery"
            type="search"
            placeholder="Ex.: 01 ou Agnes / Kaempf"
            value="${escapeHTML(query)}"
          >

          <button class="button button-primary" type="submit">
            Buscar
          </button>

        </div>

      </form>

      <div class="list-meta" id="lineCount"></div>

      <div class="line-grid" id="lineResults"></div>

      <div class="info-strip">
        As linhas e horários são provenientes do arquivo JSON fornecido.
        Consulte a validade de cada tabela.
      </div>

    </section>

  `;

  const input = document.getElementById("lineQuery");
  const results = document.getElementById("lineResults");
  const count = document.getElementById("lineCount");

  function filter() {

    const q = input.value
      .trim()
      .toLocaleLowerCase("pt-BR");

    const found = linhas.filter(line => {

      const content = `${line.linha} ${line.nome}`
        .toLocaleLowerCase("pt-BR");

      return content.includes(q);

    });

    count.textContent =
      `${found.length} de ${linhas.length} linhas encontradas`;

    results.innerHTML =
      found.map(lineCard).join("") ||
      `<div class="empty-state">
        Nenhuma linha encontrada para essa pesquisa.
      </div>`;
  }

  input.addEventListener("input", filter);

  document.getElementById("lineSearch")
    .addEventListener("submit", event => {

      event.preventDefault();
      filter();

    });

  filter();
}

/* =========================================
   PÁGINA DE HORÁRIOS
========================================= */

function renderSchedules() {

  const requestedLine =
    new URLSearchParams(window.location.search).get("linha") || "";

  app.innerHTML = `

    ${pageHeading(
      "CONSULTA DE PARTIDAS",
      "Horários de ônibus",
      "Escolha uma linha, um sentido e o tipo de serviço."
    )}

    <section class="container section-space">

      <div class="filter-panel">

        <div class="field">

          <label for="routeSelect">Linha</label>

          <select id="routeSelect">

            <option value="">Selecione uma linha</option>

            ${linhas.map(line => `
              <option value="${escapeHTML(line.linha)}">
                ${escapeHTML(line.linha)} — ${escapeHTML(line.nome)}
              </option>
            `).join("")}

          </select>

        </div>

        <div class="field">

          <label for="directionSelect">Sentido</label>

          <select id="directionSelect" disabled>
            <option value="">Selecione uma linha primeiro</option>
          </select>

        </div>

        <div class="field">

          <label for="serviceSelect">Dia / serviço</label>

          <select id="serviceSelect" disabled>
            <option value="">Selecione um sentido primeiro</option>
          </select>

        </div>

      </div>

      <div id="scheduleSummary"
           class="schedule-summary"
           aria-live="polite">

        Selecione uma linha para consultar as partidas.

      </div>

      <div id="scheduleContent"></div>

      <div class="info-strip">
        Os horários representam os dados presentes no JSON importado.
        Verifique a vigência indicada em cada tabela.
        Não há atualização automática nem rastreamento GPS.
      </div>

    </section>

  `;

  const routeSelect =
    document.getElementById("routeSelect");

  const directionSelect =
    document.getElementById("directionSelect");

  const serviceSelect =
    document.getElementById("serviceSelect");

  const summary =
    document.getElementById("scheduleSummary");

  const content =
    document.getElementById("scheduleContent");

  function selectedLine() {

    return linhas.find(line =>
      String(line.linha) === routeSelect.value
    );

  }

  function selectedDirection() {

    return selectedLine()
      ?.horarios?.timetable?.directions?.[
        Number(directionSelect.value)
      ];

  }

  function selectedService() {

    return selectedDirection()
      ?.services?.[Number(serviceSelect.value)];

  }

  /* ATUALIZAR SENTIDOS */

  function updateDirections() {

    const directions =
      selectedLine()?.horarios?.timetable?.directions ?? [];

    directionSelect.innerHTML = directions.length

      ? directions.map((d, i) => `
          <option value="${i}">
            ${escapeHTML(d.desc || `Sentido ${i + 1}`)}
          </option>
        `).join("")

      : `<option value="">Sem sentidos cadastrados</option>`;

    directionSelect.disabled = !directions.length;

    updateServices();
  }

  /* ATUALIZAR SERVIÇOS */

  function updateServices() {

    const services =
      selectedDirection()?.services ?? [];

    serviceSelect.innerHTML = services.length

      ? services.map((s, i) => `
          <option value="${i}">
            ${escapeHTML(s.desc || `Serviço ${i + 1}`)}
          </option>
        `).join("")

      : `<option value="">Sem tabela de horários</option>`;

    serviceSelect.disabled = !services.length;

    renderTable();
  }

  /* MOSTRAR TABELA */

  function renderTable() {

    const line = selectedLine();
    const direction = selectedDirection();
    const service = selectedService();

    if (!line) {

      summary.textContent =
        "Selecione uma linha para consultar as partidas.";

      content.innerHTML = "";

      return;
    }

    if (!direction || !service) {

      summary.textContent =
        `Linha ${line.linha} — ${line.nome}: não há tabela para a seleção.`;

      content.innerHTML = `
        <div class="empty-state">
          Nenhum horário cadastrado para esta opção.
        </div>
      `;

      return;
    }

    const departures = [
      ...(service.departures ?? [])
    ].sort((a, b) =>
      String(a.dep).localeCompare(String(b.dep))
    );

    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado"
    ];

    const operation = (service.days ?? [])
      .map((active, i) => active ? days[i] : null)
      .filter(Boolean)
      .join(", ") || "Não especificado";

    const groups = [

      {
        name: "Manhã",
        items: departures.filter(x => hourOf(x.dep) < 12)
      },

      {
        name: "Tarde",
        items: departures.filter(x =>
          hourOf(x.dep) >= 12 && hourOf(x.dep) < 18
        )
      },

      {
        name: "Noite",
        items: departures.filter(x => hourOf(x.dep) >= 18)
      }

    ].filter(group => group.items.length);

    summary.innerHTML = `
      <strong>
        Linha ${escapeHTML(line.linha)} — ${escapeHTML(line.nome)}
      </strong>
      <br>
      ${escapeHTML(direction.desc)}
      · ${departures.length} partida(s)
    `;

    content.innerHTML = `

      <article class="schedule-card">

        <div class="schedule-card-heading">

          <div>

            <span class="eyebrow">
              QUADRO DE HORÁRIOS
            </span>

            <h2>
              ${escapeHTML(service.desc || "Serviço")}
            </h2>

          </div>

          <span class="count-pill">
            ${departures.length} partidas
          </span>

        </div>

        <div class="schedule-validity">

          <span>
            <b>Vigência:</b>
            ${formatDate(service.start)}
            até
            ${formatDate(service.end)}
          </span>

          <span>
            <b>Opera:</b>
            ${escapeHTML(operation)}
          </span>

        </div>

        ${
          groups.length

          ? groups.map(group => `

              <section class="time-period">

                <h3>${group.name}</h3>

                <div class="table-wrap">

                  <table class="time-table">

                    <thead>
                      <tr>
                        <th>Saída</th>
                        <th>Chegada prevista</th>
                      </tr>
                    </thead>

                    <tbody>

                      ${group.items.map(item => `

                        <tr>

                          <td>
                            <strong>
                              ${escapeHTML(item.dep || "—")}
                            </strong>
                          </td>

                          <td>
                            ${escapeHTML(item.arr || "—")}
                          </td>

                        </tr>

                      `).join("")}

                    </tbody>

                  </table>

                </div>

              </section>

            `).join("")

          : `
            <div class="empty-state">
              Não há partidas cadastradas.
            </div>
          `
        }

      </article>

    `;
  }

  /* IDENTIFICAR HORÁRIO */

  function hourOf(time) {

    const n = Number(
      String(time || "00:00").split(":")[0]
    );

    return Number.isFinite(n) ? n : 0;
  }

  /* EVENTOS DOS FILTROS */

  routeSelect.addEventListener(
    "change",
    updateDirections
  );

  directionSelect.addEventListener(
    "change",
    updateServices
  );

  serviceSelect.addEventListener(
    "change",
    renderTable
  );

  /* ABRIR LINHA RECEBIDA PELA URL */

  if (
    requestedLine &&
    linhas.some(line => String(line.linha) === requestedLine)
  ) {

    routeSelect.value = requestedLine;

    updateDirections();

  }
}

/* =========================================
   PÁGINA DO MAPA
========================================= */

function renderMap() {

  app.innerHTML = `

    ${pageHeading(
      "LOCALIZAÇÃO",
      "Mapa de Santa Cruz do Sul",
      "Consulte a referência geográfica da cidade."
    )}

    <section class="container section-space">

      <div class="map-notice">

        <strong>Sobre este mapa:</strong>

        O arquivo JSON recebido contém linhas, sentidos
        e horários, mas não traz coordenadas de paradas
        nem o traçado geográfico das viagens.

        Por isso, o mapa abaixo é apenas uma referência
        da cidade e não representa o caminho de uma
        linha específica.

      </div>

      <div class="map-frame">

        <iframe
          title="Mapa de referência de Santa Cruz do Sul"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-52.46%2C-29.75%2C-52.37%2C-29.68&layer=mapnik"
          loading="lazy">
        </iframe>

      </div>

      <p class="map-attribution">
        Mapa ©
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener">
          OpenStreetMap
        </a>.
      </p>

    </section>

  `;
}

/* =========================================
   PÁGINA SOBRE
========================================= */

function renderAbout() {

  app.innerHTML = `

    ${pageHeading(
      "CONHEÇA O PROJETO",
      "Sobre o RotaBus",
      "Uma forma simples de consultar informações do transporte coletivo."
    )}

    <section class="container section-space about-layout">

      <article class="about-card">

        <span class="eyebrow">NOSSO OBJETIVO</span>

        <h2>Seu caminho começa aqui!</h2>

        <p>
          O RotaBus é um protótipo de consulta ao transporte
          público de Santa Cruz do Sul. A proposta é reunir
          em um só lugar a lista de linhas, sentidos e horários
          de partida e chegada.
        </p>

      </article>

      <article class="about-card">

        <span class="eyebrow">DADOS E LIMITAÇÕES</span>

        <h2>Informações de horários</h2>

        <p>
          Os horários desta versão são carregados do arquivo
          JSON fornecido para o projeto. Cada serviço pode
          ter sua própria data de início e fim de vigência.
          O site não atualiza os dados automaticamente.
        </p>

        <p>
          O protótipo não oferece rastreamento GPS em tempo
          real. O mapa é apenas uma referência geográfica
          e não mostra trajetos confirmados das linhas.
        </p>

      </article>

      <article class="about-card">

        <span class="eyebrow">TECNOLOGIAS</span>

        <h2>Desenvolvimento</h2>

        <p>
          O projeto utiliza HTML para estruturar as páginas,
          CSS para definir a identidade visual e JavaScript
          para carregar e organizar as informações do arquivo JSON.
        </p>

      </article>

    </section>

  `;
}

/* =========================================
   MENU PARA CELULARES
========================================= */

const menuToggle =
  document.getElementById("menuToggle");

const mainNav =
  document.getElementById("mainNav");

if (menuToggle && mainNav) {

  menuToggle.addEventListener("click", () => {

    const open = mainNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

  });

}

/* INICIAR O SITE */

loadData();

const THEME_KEY = "rotabus-theme";
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  const activeTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", activeTheme);

  if (themeToggle) {
    themeToggle.textContent =
      activeTheme === "dark" ? "Modo claro" : "Modo escuro";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}

initTheme();