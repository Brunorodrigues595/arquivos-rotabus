

/* =====================================================
   ROTABUS - APLICAÇÃO PRINCIPAL
   Carrega os dados de rotabus-horarios.json
===================================================== */

const DATA_URL = "./rotabus-horarios.json";
const app = document.getElementById("app");

const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

const LEAFLET_JS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

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
   PÁGINA DO MAPA: TODAS AS LINHAS E VIAGENS
========================================= */

function renderMap() {
  app.innerHTML = `
    ${pageHeading(
      "ITINERÁRIOS",
      "Mapa de linhas de ônibus",
      "Escolha uma linha, uma viagem e encontre as paradas do percurso."
    )}

    <section class="container section-space">
      <div class="info-strip" style="margin-bottom:18px;">
        <strong>Importante:</strong> os trajetos foram extraídos do Bus2.
        O mapa não rastreia os ônibus em tempo real.
      </div>

      <style>
        .map-filter-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:18px;margin-bottom:18px;border:1px solid var(--border,#294052);border-radius:16px;background:var(--surface,#172534)}
        .map-filter-panel .field{min-width:0}.map-filter-panel label,.map-stop-search label{display:block;margin-bottom:8px;font-weight:700}
        .map-filter-panel select,.map-stop-search input{box-sizing:border-box;width:100%;min-height:46px;padding:10px 14px;border:1px solid var(--border,#294052);border-radius:10px;background:var(--input-bg,#172534);color:var(--text,#eaf2f8);font:inherit}
        .map-workspace{display:grid;grid-template-columns:minmax(260px,330px) minmax(0,1fr);gap:16px}
        .map-stops-panel{height:580px;min-width:0;display:flex;flex-direction:column;padding:16px;border:1px solid var(--border,#294052);border-radius:16px;background:var(--surface,#172534)}
        .map-stops-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px}.map-stops-heading h2{margin:0;font-size:18px}
        .map-stop-count{padding:4px 9px;border-radius:99px;background:rgba(25,118,210,.16);color:#55aaff;font-size:12px;font-weight:800;white-space:nowrap}
        .map-stop-search{margin-bottom:12px}.map-stop-list{display:flex;flex-direction:column;gap:7px;overflow-y:auto;min-height:0;padding-right:4px}
        .map-stop-item{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;align-items:center;width:100%;padding:10px;text-align:left;border:1px solid var(--border,#294052);border-radius:11px;background:transparent;color:var(--text,#eaf2f8);cursor:pointer;font:inherit}
        .map-stop-item:hover,.map-stop-item:focus-visible{background:rgba(25,118,210,.12);border-color:#1976d2;outline:none}
        .map-stop-number{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f5b700;color:#17202a;font-size:12px;font-weight:900}
        .map-stop-item.is-start .map-stop-number{background:#16a34a;color:#fff}.map-stop-item.is-end .map-stop-number{background:#dc4646;color:#fff}
        .map-stop-name{display:block;font-size:13px;line-height:1.35;font-weight:650}.map-stop-kind{display:block;margin-top:3px;font-size:11px;opacity:.72}.map-stop-empty{padding:16px 8px;opacity:.7;font-size:13px}
        .map-canvas-wrap{height:580px;min-width:0;overflow:hidden;border:1px solid var(--border,#294052);border-radius:16px;background:#e8edf1}#routeMap{width:100%;height:100%}
        .map-route-endpoint{display:grid;place-items:center;width:28px;height:28px;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px #0005;color:#fff;font-size:13px;font-weight:900}.map-route-endpoint span{transform:rotate(45deg)}.map-route-start{background:#16a34a}.map-route-finish{background:#dc4646}
        .map-itinerary-card{margin-top:18px}.map-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:12px}.map-legend-item{display:inline-flex;align-items:center;gap:7px}.map-legend-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
        @media(max-width:850px){.map-workspace{grid-template-columns:1fr}.map-stops-panel{height:320px}.map-canvas-wrap{height:450px}}
        @media(max-width:600px){.map-filter-panel{grid-template-columns:1fr;padding:14px}.map-canvas-wrap{height:380px}}
        /* CORREÇÃO DAS CORES DO MAPA */

.map-filter-panel,
.map-stops-panel {
  background: var(--white, #17222f) !important;
  color: var(--ink, #e6eef5);
  border-color: var(--line, #28384a);
}

.map-stops-heading h2,
.map-stop-item {
  color: var(--ink, #e6eef5);
}

.map-stop-item {
  background: var(--white, #17222f);
  border-color: var(--line, #28384a);
}

.map-filter-panel label,
.map-stop-search label {
  color: var(--ink, #e6eef5);
}

.map-filter-panel select,
.map-stop-search input {
  background: var(--white, #17222f);
  color: var(--ink, #e6eef5);
  border-color: var(--line, #28384a);
}

.map-stop-name {
  color: var(--ink, #e6eef5);
}

.map-stop-kind {
  color: var(--muted, #9eb0c2);
}

.map-stop-item:hover {
  background: var(--blue-soft, #1e354d);
}
      </style>

      <div class="map-filter-panel">
        <div class="field"><label for="mapRouteSelect">Linha</label><select id="mapRouteSelect"><option value="">Carregando linhas...</option></select></div>
        <div class="field"><label for="mapTripSelect">Viagem / sentido</label><select id="mapTripSelect" disabled><option value="">Selecione uma linha primeiro</option></select></div>
      </div>

      <div class="map-workspace">
        <aside class="map-stops-panel" aria-label="Lista de paradas">
          <div class="map-stops-heading"><h2>Paradas do trajeto</h2><span class="map-stop-count" id="mapStopCount">0 paradas</span></div>
          <div class="map-stop-search"><label for="mapStopSearch">Pesquisar parada</label><input id="mapStopSearch" type="search" placeholder="Digite o nome da rua ou parada..." autocomplete="off"></div>
          <div class="map-stop-list" id="mapStopList" aria-live="polite"><div class="map-stop-empty">Selecione uma viagem para ver as paradas.</div></div>
        </aside>
        <div class="map-canvas-wrap"><div id="routeMap" aria-label="Mapa do itinerário selecionado"></div></div>
      </div>

      <div id="routeMapInfo" class="map-itinerary-card" aria-live="polite"></div>
    </section>
  `;

  const lineSelect = document.getElementById("mapRouteSelect");
  const tripSelect = document.getElementById("mapTripSelect");
  const searchInput = document.getElementById("mapStopSearch");
  const stopList = document.getElementById("mapStopList");
  const stopCount = document.getElementById("mapStopCount");
  const info = document.getElementById("routeMapInfo");

  let map;
  let routeLayer;
  let stopsLayer;
  let allTrips = [];
  let selectedStops = [];
  let markers = new Map();

  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      if (window.L) return resolve();

      if (!document.getElementById("leaflet-css")) {
        const css = document.createElement("link");
        css.id = "leaflet-css";
        css.rel = "stylesheet";
        css.href = LEAFLET_CSS;
        document.head.appendChild(css);
      }

      const existing = document.querySelector('script[data-leaflet-loader="true"]');
      if (existing) {
        if (existing.dataset.loaded === "true" && window.L) return resolve();
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Não foi possível carregar o Leaflet.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.dataset.leafletLoader = "true";
      script.src = LEAFLET_JS;
      script.onload = () => { script.dataset.loaded = "true"; resolve(); };
      script.onerror = () => reject(new Error("Não foi possível carregar o Leaflet."));
      document.head.appendChild(script);
    });
  }

  // Converte o campo shape do Bus2 em coordenadas [latitude, longitude].
  function decodeShape(encoded) {
    let index = 0, lat = 0, lng = 0;
    const points = [];

    while (index < encoded.length) {
      let result = 0, shift = 0, byte;
      do {
        if (index >= encoded.length) throw new Error("Traçado incompleto.");
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);

      result = 0; shift = 0;
      do {
        if (index >= encoded.length) throw new Error("Traçado incompleto.");
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  }

  function fillLineOptions() {
    const grouped = new Map();
    allTrips.forEach(trip => {
      const key = String(trip.linha);
      if (!grouped.has(key)) grouped.set(key, {
        linha: key,
        nome: trip.nomeLinha || trip.routeName || `Linha ${key}`
      });
    });

    const lines = [...grouped.values()].sort((a, b) =>
      a.linha.localeCompare(b.linha, "pt-BR", { numeric: true })
    );

    lineSelect.innerHTML = lines.map(line => `
      <option value="${escapeHTML(line.linha)}">${escapeHTML(line.linha)} — ${escapeHTML(line.nome)}</option>
    `).join("");
    lineSelect.value = lines.some(line => line.linha === "10") ? "10" : (lines[0]?.linha || "");
    fillTripOptions();
  }

  function fillTripOptions() {
    const trips = allTrips.filter(trip => String(trip.linha) === lineSelect.value);
    tripSelect.innerHTML = trips.map(trip => `
      <option value="${escapeHTML(String(trip.tripId))}">${escapeHTML(trip.tripName || `Viagem ${trip.tripId}`)} (${trip.stops.length} paradas)</option>
    `).join("");
    tripSelect.disabled = !trips.length;

    if (lineSelect.value === "10") {
      const firstTested = trips.find(trip => String(trip.tripName).toLocaleLowerCase("pt-BR") === "oktober via galo");
      if (firstTested) tripSelect.value = String(firstTested.tripId);
    }
    drawSelectedTrip();
  }

  function renderStopList() {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = selectedStops.map((stop, index) => ({ stop, index }))
      .filter(({ stop }) => String(stop.name || "").toLocaleLowerCase("pt-BR").includes(query));

    stopCount.textContent = `${filtered.length} de ${selectedStops.length} paradas`;
    if (!filtered.length) {
      stopList.innerHTML = `<div class="map-stop-empty">Nenhuma parada encontrada.</div>`;
      return;
    }

    stopList.innerHTML = filtered.map(({ stop, index }) => {
      const start = index === 0;
      const end = index === selectedStops.length - 1;
      const kind = start ? "Início do percurso" : (end ? "Fim do percurso" : `Parada ${index + 1}`);
      const className = start ? "is-start" : (end ? "is-end" : "");
      const number = start ? "I" : (end ? "F" : String(index + 1));
      return `<button type="button" class="map-stop-item ${className}" data-stop-index="${index}">
        <span class="map-stop-number">${number}</span><span>
          <span class="map-stop-name">${escapeHTML(stop.name || `Parada ${index + 1}`)}</span>
          <span class="map-stop-kind">${kind}</span>
        </span></button>`;
    }).join("");

    stopList.querySelectorAll("[data-stop-index]").forEach(button => {
      button.addEventListener("click", () => {
        const marker = markers.get(Number(button.dataset.stopIndex));
        if (!marker) return;
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 16));
        marker.openPopup();
      });
    });
  }

  function drawSelectedTrip() {
    const trip = allTrips.find(item =>
      String(item.linha) === lineSelect.value && String(item.tripId) === tripSelect.value
    );

    if (routeLayer) map.removeLayer(routeLayer);
    if (stopsLayer) map.removeLayer(stopsLayer);
    routeLayer = null;
    stopsLayer = null;
    markers = new Map();
    selectedStops = [];
    searchInput.value = "";

    if (!trip) {
      info.innerHTML = `<div class="empty-state">Não há viagens cadastradas para esta linha.</div>`;
      stopList.innerHTML = `<div class="map-stop-empty">Nenhuma parada disponível.</div>`;
      stopCount.textContent = "0 paradas";
      return;
    }

    try {
      const points = decodeShape(trip.shape || "");
      if (points.length < 2) throw new Error("O traçado desta viagem não possui pontos suficientes.");

      routeLayer = L.polyline(points, { color: "#1976D2", weight: 5, opacity: .92 }).addTo(map);
      stopsLayer = L.layerGroup().addTo(map);
      selectedStops = (trip.stops || []).filter(stop =>
        Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng))
      );

      selectedStops.forEach((stop, index) => {
        const start = index === 0;
        const end = index === selectedStops.length - 1;
        const position = [Number(stop.lat), Number(stop.lng)];
        let marker;

        if (start || end) {
          const icon = L.divIcon({
            className: "",
            html: `<div class="map-route-endpoint ${start ? "map-route-start" : "map-route-finish"}"><span>${start ? "I" : "F"}</span></div>`,
            iconSize: [34, 34], iconAnchor: [17, 30], popupAnchor: [0, -28]
          });
          marker = L.marker(position, { icon });
        } else {
          marker = L.circleMarker(position, {
            radius: 5, color: "#fff", weight: 2, fillColor: "#F5B700", fillOpacity: 1
          });
        }

        marker.bindPopup(`<strong>${escapeHTML(stop.name || `Parada ${index + 1}`)}</strong><br>${start ? "Início do percurso" : (end ? "Fim do percurso" : `Parada ${index + 1} de ${selectedStops.length}`)}`);
        marker.addTo(stopsLayer);
        markers.set(index, marker);
      });

      renderStopList();
      map.fitBounds(routeLayer.getBounds(), { padding: [28, 28] });
      info.innerHTML = `<article class="about-card">
        <span class="eyebrow">ITINERÁRIO</span>
        <h2>${escapeHTML(trip.routeName || `Linha ${trip.linha}`)}</h2>
        <p><strong>Viagem:</strong> ${escapeHTML(trip.tripName || "Não identificada")}</p>
        <p><strong>Paradas:</strong> ${selectedStops.length}</p>
        <div class="map-legend">
          <span class="map-legend-item"><i class="map-legend-dot" style="background:#16a34a"></i> Início</span>
          <span class="map-legend-item"><i class="map-legend-dot" style="background:#f5b700"></i> Paradas</span>
          <span class="map-legend-item"><i class="map-legend-dot" style="background:#dc4646"></i> Fim</span>
        </div></article>`;
      setTimeout(() => map.invalidateSize(), 150);
    } catch (error) {
      console.error("Erro ao desenhar a viagem:", error);
      info.innerHTML = `<div class="alert alert-error"><strong>Não foi possível desenhar esta viagem.</strong><p>${escapeHTML(error.message)}</p></div>`;
    }
  }

  async function initializeMap() {
    try {
      info.innerHTML = `<p>Carregando os trajetos...</p>`;
      const response = await fetch("./rotabus-trajetos.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Não foi possível abrir rotabus-trajetos.json. Confira se está na pasta principal do projeto.");

      const data = await response.json();
      if (!Array.isArray(data.trajetos) || !data.trajetos.length) throw new Error("O arquivo de trajetos não contém viagens.");
      allTrips = data.trajetos.filter(trip => trip && trip.shape && Array.isArray(trip.stops) && trip.stops.length);
      if (!allTrips.length) throw new Error("Nenhuma viagem possui traçado e paradas válidos.");

      await loadLeaflet();
      map = L.map("routeMap");
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      lineSelect.addEventListener("change", fillTripOptions);
      tripSelect.addEventListener("change", drawSelectedTrip);
      searchInput.addEventListener("input", renderStopList);
      fillLineOptions();
      setTimeout(() => map.invalidateSize(), 250);
    } catch (error) {
      console.error("Erro ao carregar o mapa:", error);
      info.innerHTML = `<div class="alert alert-error"><strong>Não foi possível carregar os trajetos.</strong><p>${escapeHTML(error.message)}</p><p>Confira se rotabus-trajetos.json está na mesma pasta do app.js e abra pelo Live Server.</p></div>`;
    }
  }

  initializeMap();
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
          real. A página de mapa permite consultar itinerários
          e paradas cadastrados para as viagens disponíveis.
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

