/* =========================================
   DADOS
========================================= */

let guests = [];

let currentFilter = "todos";

let guestToDelete = null;


/* =========================================
   ELEMENTOS
========================================= */

const loginScreen =
    document.getElementById("loginScreen");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");


/* =========================================
   LOGIN DE TESTE
========================================= */

/*
 * IMPORTANTE:
 *
 * Este login é apenas para testar
 * a interface.
 *
 * NÃO usar em produção.
 *
 * Na próxima etapa vamos substituir
 * pelo Supabase Auth.
 */

const TEST_EMAIL =
    "admin@convite.com";

const TEST_PASSWORD =
    "123456";


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim();

        const password =
            document.getElementById(
                "loginPassword"
            ).value;

        const loginError =
            document.getElementById(
                "loginError"
            );

        loginError.classList.add("hidden");

        const button =
            loginForm.querySelector(
                'button[type="submit"]'
            );

        button.disabled = true;
        button.textContent = "Entrando...";

        const {
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        button.disabled = false;
        button.textContent = "Entrar";

        if (error) {

            console.error(
                "Erro no login:",
                error
            );

            loginError.textContent =
                "E-mail ou senha incorretos.";

            loginError.classList.remove(
                "hidden"
            );

            return;
        }

        loginScreen.classList.add(
            "hidden"
        );

        adminPanel.classList.remove(
            "hidden"
        );

        await loadDashboard();
    }
);


/* =========================================
   VERIFICAR LOGIN
========================================= */

async function checkLogin() {

    const {
        data
    } = await supabaseClient.auth.getSession();

    if (data.session) {

        loginScreen.classList.add(
            "hidden"
        );

        adminPanel.classList.remove(
            "hidden"
        );

        await loadDashboard();
    }
}

checkLogin();


/* =========================================
   LOGOUT
========================================= */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            location.reload();

        }
    );


/* =========================================
   NAVEGAÇÃO
========================================= */

const navigationLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


navigationLinks.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;


                navigationLinks.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".admin-section"
                    )
                    .forEach(
                        item =>
                            item.classList.add(
                                "hidden"
                            )
                    );


                document
                    .getElementById(
                        section + "Section"
                    )
                    .classList.remove(
                        "hidden"
                    );


                const titles = {

                    dashboard:
                        "Dashboard da Festa 🎀",

                    guests:
                        "Lista de Convidados",

                    settings:
                        "Configurações do Convite"

                };


                document
                    .getElementById(
                        "pageTitle"
                    )
                    .textContent =
                        titles[section];


                if (
                    section === "dashboard"
                ) {

                    loadDashboard();

                }

                if (
                    section === "guests"
                ) {

                    renderGuests();

                }

            }
        );

    }
);


/* =========================================
   DASHBOARD
========================================= */

async function loadDashboard() {

    const {
        data,
        error
    } = await supabaseClient
        .from("confirmacoes")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Erro ao carregar confirmações:",
            error
        );

        alert(
            "Não foi possível carregar as confirmações."
        );

        return;
    }

    guests = data || [];

    const total =
        guests.length;

    const confirmed =
        guests.filter(
            guest =>
                guest.status ===
                "confirmado"
        );

    const declined =
        guests.filter(
            guest =>
                guest.status ===
                "nao"
        );

    const pending =
        guests.filter(
            guest =>
                guest.status ===
                "aguardando"
        );

    const totalPeople =
        confirmed.reduce(
            (sum, guest) =>
                sum +
                Number(
                    guest.quantidade_pessoas
                ),
            0
        );

    document
        .getElementById("totalGuests")
        .textContent = total;

    document
        .getElementById("confirmedGuests")
        .textContent =
            confirmed.length;

    document
        .getElementById("declinedGuests")
        .textContent =
            declined.length;

    document
        .getElementById("pendingGuests")
        .textContent =
            pending.length;

    document
        .getElementById("totalPeople")
        .textContent =
            totalPeople;

    const percentage =
        value =>
            total
                ? Math.round(
                    value / total * 100
                )
                : 0;

    updateProgress(
        "confirmed",
        percentage(confirmed.length)
    );

    updateProgress(
        "declined",
        percentage(declined.length)
    );

    updateProgress(
        "pending",
        percentage(pending.length)
    );

    renderRecentGuests();
}


/* =========================================
   PROGRESSO
========================================= */

function updateProgress(
    type,
    value
) {

    document
        .getElementById(
            type + "Percent"
        )
        .textContent =
            value + "%";


    document
        .getElementById(
            type + "Progress"
        )
        .style.width =
            value + "%";

}


/* =========================================
   RECENTES
========================================= */

function renderRecentGuests() {

    const container =
        document.getElementById(
            "recentGuests"
        );


    const recent =
        [...guests]
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            )
            .slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhuma confirmação ainda.
            </div>
        `;

        return;

    }


    container.innerHTML =
        recent.map(
            guest => `

                <div class="recent-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                guest.nome
                            )}
                        </strong>

                        <span>
                            ${guest.quantidade_pessoas}
                            pessoa(s)
                        </span>

                    </div>

                    <span>
                        ${formatDate(
                            guest.created_at
                        )}
                    </span>

                </div>

            `
        ).join("");

}


/* =========================================
   LISTA
========================================= */

function renderGuests() {

    const table =
        document.getElementById(
            "guestTable"
        );

    const empty =
        document.getElementById(
            "emptyGuests"
        );


    const search =
        document
            .getElementById(
                "searchGuest"
            )
            .value
            .toLowerCase();


    let filtered =
        [...guests];


    if (
        currentFilter !==
        "todos"
    ) {

        filtered =
            filtered.filter(
                guest =>
                    guest.status ===
                    currentFilter
            );

    }


    if (search) {

        filtered =
            filtered.filter(
                guest =>
                    guest.nome
                        .toLowerCase()
                        .includes(search)
            );

    }


    if (!filtered.length) {

        table.innerHTML = "";

        empty.classList.remove(
            "hidden"
        );

        return;

    }


    empty.classList.add(
        "hidden"
    );


    table.innerHTML =
        filtered.map(
            guest => `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(
                                guest.nome
                            )}
                        </strong>

                    </td>

                    <td>
                        ${guest.quantidade_pessoas}
                    </td>

                    <td>
                        ${getStatusBadge(
                            guest.status
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            guest.created_at
                        )}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-button"
                                onclick="openEdit(${guest.id})"
                            >
                                ✏️
                            </button>

                            <button
                                class="action-button"
                                onclick="openDelete(${guest.id})"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>

            `
        ).join("");

}


/* =========================================
   FILTROS
========================================= */

document
    .querySelectorAll(
        ".filter-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-button"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    currentFilter =
                        button.dataset.filter;

                    renderGuests();

                }
            );

        }
    );


document
    .getElementById("searchGuest")
    .addEventListener(
        "input",
        renderGuests
    );


/* =========================================
   EDITAR
========================================= */

function openEdit(id) {

    const guest =
        guests.find(
            item =>
                item.id === id
        );


    if (!guest) return;


    document
        .getElementById("editId")
        .value = guest.id;

    document
        .getElementById("editName")
        .value = guest.nome;

    document
        .getElementById("editPeople")
        .value =
            guest.quantidade_pessoas;

    document
        .getElementById("editStatus")
        .value =
            guest.status;

    document
        .getElementById("editObservation")
        .value =
            guest.observacao || "";


    document
        .getElementById("editModal")
        .classList.remove(
            "hidden"
        );

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeEdit
    );


function closeEdit() {

    document
        .getElementById("editModal")
        .classList.add(
            "hidden"
        );

}


document
    .getElementById("editForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const id =
                Number(
                    document
                        .getElementById(
                            "editId"
                        )
                        .value
                );

            const updates = {
                nome:
                    document.getElementById(
                        "editName"
                    ).value.trim(),

                quantidade_pessoas:
                    Number(
                        document.getElementById(
                            "editPeople"
                        ).value
                    ),

                status:
                    document.getElementById(
                        "editStatus"
                    ).value,

                observacao:
                    document.getElementById(
                        "editObservation"
                    ).value.trim()
            };

            const {
                error
            } = await supabaseClient
                .from("confirmacoes")
                .update(updates)
                .eq("id", id);

            if (error) {

                console.error(
                    "Erro ao editar confirmação:",
                    error
                );

                alert(
                    "Não foi possível salvar as alterações."
                );

                return;
            }

            closeEdit();
            await loadDashboard();
            renderGuests();
        }
    );


/* =========================================
   EXCLUIR
========================================= */

function openDelete(id) {

    guestToDelete = id;

    document
        .getElementById("deleteModal")
        .classList.remove(
            "hidden"
        );

}


document
    .getElementById("cancelDelete")
    .addEventListener(
        "click",
        () => {

            guestToDelete = null;

            document
                .getElementById(
                    "deleteModal"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


document
    .getElementById("confirmDelete")
    .addEventListener(
        "click",
        async () => {

            if (!guestToDelete)
                return;

            const {
                error
            } = await supabaseClient
                .from("confirmacoes")
                .delete()
                .eq("id", guestToDelete);

            if (error) {

                console.error(
                    "Erro ao excluir confirmação:",
                    error
                );

                alert(
                    "Não foi possível excluir a confirmação."
                );

                return;
            }

            guestToDelete = null;

            document
                .getElementById(
                    "deleteModal"
                )
                .classList.add(
                    "hidden"
                );

            await loadDashboard();
            renderGuests();
        }
    );


/* =========================================
   SALVAR
========================================= */

// As confirmações agora são salvas diretamente no Supabase.


/* =========================================
   EXPORTAR CSV
========================================= */

document
    .getElementById("exportCsv")
    .addEventListener(
        "click",
        () => {

            if (!guests.length) {

                alert(
                    "Não existem confirmações para exportar."
                );

                return;

            }


            const headers = [
                "Nome",
                "Quantidade de pessoas",
                "Status",
                "Observação",
                "Data"
            ];


            const rows =
                guests.map(
                    guest => [

                        guest.nome,

                        guest.quantidade_pessoas,

                        guest.status,

                        guest.observacao || "",

                        formatDate(
                            guest.created_at
                        )

                    ]
                );


            const csv =
                [
                    headers,
                    ...rows
                ]
                .map(
                    row =>
                        row.map(
                            value =>
                                `"${String(value)
                                    .replaceAll(
                                        '"',
                                        '""'
                                    )}"`
                        ).join(";")
                )
                .join("\n");


            const blob =
                new Blob(
                    [
                        "\uFEFF" + csv
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "lista-convidados.csv";

            link.click();

            URL.revokeObjectURL(url);

        }
    );


/* =========================================
   RELATÓRIO
========================================= */

document
    .getElementById("printReport")
    .addEventListener(
        "click",
        () => {

            const confirmed =
                guests.filter(
                    guest =>
                        guest.status ===
                        "confirmado"
                );


            const declined =
                guests.filter(
                    guest =>
                        guest.status ===
                        "nao"
                );


            const pending =
                guests.filter(
                    guest =>
                        guest.status ===
                        "aguardando"
                );


            const totalPeople =
                confirmed.reduce(
                    (sum, guest) =>
                        sum +
                        Number(
                            guest.quantidade_pessoas
                        ),
                    0
                );


            const report =
                `
                <!DOCTYPE html>

                <html lang="pt-BR">

                <head>

                    <meta charset="UTF-8">

                    <title>
                        Relatório da Festa
                    </title>

                    <style>

                        body {
                            font-family: Arial;
                            padding: 40px;
                            color: #333;
                        }

                        h1 {
                            color: #805d70;
                        }

                        .stats {
                            display: flex;
                            gap: 30px;
                            margin: 30px 0;
                        }

                        .card {
                            padding: 20px;
                            border: 1px solid #ddd;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        th, td {
                            padding: 10px;
                            border: 1px solid #ddd;
                            text-align: left;
                        }

                    </style>

                </head>

                <body>

                    <h1>
                        Relatório da Festa 🎀
                    </h1>

                    <div class="stats">

                        <div class="card">
                            <strong>
                                Total de convidados
                            </strong>

                            <br>

                            ${guests.length}
                        </div>

                        <div class="card">
                            <strong>
                                Confirmações
                            </strong>

                            <br>

                            ${confirmed.length}
                        </div>

                        <div class="card">
                            <strong>
                                Pessoas confirmadas
                            </strong>

                            <br>

                            ${totalPeople}
                        </div>

                        <div class="card">
                            <strong>
                                Não irão
                            </strong>

                            <br>

                            ${declined.length}
                        </div>

                        <div class="card">
                            <strong>
                                Aguardando
                            </strong>

                            <br>

                            ${pending.length}
                        </div>

                    </div>


                    <h2>
                        Lista de convidados
                    </h2>

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Nome
                                </th>

                                <th>
                                    Pessoas
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Data
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${
                                guests.map(
                                    guest => `

                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                guest.nome
                                            )}
                                        </td>

                                        <td>
                                            ${guest.quantidade_pessoas}
                                        </td>

                                        <td>
                                            ${guest.status}
                                        </td>

                                        <td>
                                            ${formatDate(
                                                guest.created_at
                                            )}
                                        </td>

                                    </tr>

                                `
                                ).join("")
                            }

                        </tbody>

                    </table>

                </body>

                </html>
                `;


            const reportWindow =
                window.open(
                    "",
                    "_blank"
                );


            reportWindow.document.write(
                report
            );

            reportWindow.document.close();

            reportWindow.print();

        }
    );


/* =========================================
   CONFIGURAÇÕES
========================================= */

const defaultConfig = {

    nome: "",

    idade: "",

    data: "",

    horario: "",

    local: "",

    endereco: "",

    maps:
        "https://www.google.com/maps/search/?api=1&query=Rua+das+Flores+123",

    whatsapp:
        "5579999999999",

    message:
        "Um ano de descobertas, sorrisos, carinho e muito amor."

};


function loadSettings() {

    const config =
        JSON.parse(
            localStorage.getItem(
                "conviteConfig"
            )
        ) || defaultConfig;


    document.getElementById(
        "configName"
    ).value = config.nome;

    document.getElementById(
        "configAge"
    ).value = config.idade;

    document.getElementById(
        "configDate"
    ).value = config.data;

    document.getElementById(
        "configTime"
    ).value = config.horario;

    document.getElementById(
        "configLocation"
    ).value = config.local;

    document.getElementById(
        "configAddress"
    ).value = config.endereco;

    document.getElementById(
        "configMaps"
    ).value = config.maps;

    document.getElementById(
        "configWhatsapp"
    ).value = config.whatsapp;

    document.getElementById(
        "configMessage"
    ).value = config.message;

}


loadSettings();


document
    .getElementById("settingsForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const config = {

                nome:
                    document.getElementById(
                        "configName"
                    ).value,

                idade:
                    document.getElementById(
                        "configAge"
                    ).value,

                data:
                    document.getElementById(
                        "configDate"
                    ).value,

                horario:
                    document.getElementById(
                        "configTime"
                    ).value,

                local:
                    document.getElementById(
                        "configLocation"
                    ).value,

                endereco:
                    document.getElementById(
                        "configAddress"
                    ).value,

                maps:
                    document.getElementById(
                        "configMaps"
                    ).value,

                whatsapp:
                    document.getElementById(
                        "configWhatsapp"
                    ).value,

                message:
                    document.getElementById(
                        "configMessage"
                    ).value

            };


            localStorage.setItem(
                "conviteConfig",
                JSON.stringify(config)
            );


            const saved =
                document.getElementById(
                    "settingsSaved"
                );


            saved.classList.remove(
                "hidden"
            );


            setTimeout(
                () =>
                    saved.classList.add(
                        "hidden"
                    ),
                2500
            );

        }
    );


/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function formatDate(date) {

    if (!date)
        return "-";


    return new Date(date)
        .toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


function getStatusBadge(status) {

    const labels = {

        confirmado:
            "Confirmado",

        nao:
            "Não irá",

        aguardando:
            "Aguardando"

    };


    return `
        <span
            class="status status-${status}"
        >
            ${labels[status] || status}
        </span>
    `;

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}