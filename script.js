
/* =====================================
   ROTABUS - FUNCIONALIDADES
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    // =================================
    // PESQUISA DA PÁGINA INICIAL
    // =================================

    const homeSearch = document.getElementById("home-search");
    const homeQuery = document.getElementById("home-query");

    if (homeSearch && homeQuery) {

        homeSearch.addEventListener("submit", function (event) {

            event.preventDefault();

            const query = homeQuery.value.trim();

            if (query !== "") {
                window.location.href =
                    "linhas.html?q=" + encodeURIComponent(query);
            }

        });

    }


    // =================================
    // PESQUISA DE LINHAS
    // =================================

    const lineSearch = document.getElementById("line-search");
    const lineQuery = document.getElementById("line-query");

    const lineCards = document.querySelectorAll(".searchable");
    const noLines = document.getElementById("no-lines");


    function filterLines() {

        if (!lineQuery) return;

        const search = lineQuery.value
            .trim()
            .toLowerCase();

        let visibleCount = 0;

        lineCards.forEach(function (card) {

            const content = (
                card.innerText + " " +
                card.dataset.search
            ).toLowerCase();

            const matches = content.includes(search);

            card.style.display = matches ? "" : "none";

            if (matches) {
                visibleCount++;
            }

        });

        if (noLines) {
            noLines.hidden = visibleCount !== 0;
        }

    }


    if (lineSearch && lineQuery) {

        lineSearch.addEventListener("submit", function (event) {

            event.preventDefault();
            filterLines();

        });

        lineQuery.addEventListener("input", filterLines);

        // Recebe a pesquisa feita na página inicial

        const params = new URLSearchParams(window.location.search);

        const initialQuery = params.get("q");

        if (initialQuery) {
            lineQuery.value = initialQuery;
            filterLines();
        }

    }


    // =================================
    // FILTRO DE HORÁRIOS
    // =================================

    const scheduleSelect =
        document.getElementById("schedule-line");

    const scheduleCards =
        document.querySelectorAll(".schedule-card");


    if (scheduleSelect) {

        scheduleSelect.addEventListener("change", function () {

            const selected = scheduleSelect.value;

            scheduleCards.forEach(function (card) {

                const line = card.dataset.schedule;

                const matches =
                    selected === "all" || selected === line;

                card.style.display = matches ? "" : "none";

            });

        });

    }


    // =================================
    // NAVEGAÇÃO E PÁGINA ATUAL
    // =================================

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("nav a").forEach(function (link) {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

    });

});
