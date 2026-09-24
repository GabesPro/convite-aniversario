/* =========================================
   CONFIGURAÇÕES DO CONVITE
========================================= */

const CONFIG = {

    nome: "Helena",

    idade: "1 aninho!",

    data: "20/01/2027",

    dataISO: "2027-01-20T16:00:00",

    horario: "17:00",

    local: "Minha casa",

    endereco: "LOT JACOMILDES BARRETO, 123",

    googleMaps:
        "https://maps.app.goo.gl/51Rr49eHg5XLHEtR6",

    whatsapp:
        "5579998467982",

    mensagem: `
Um ano de descobertas, sorrisos,
carinho e muito amor.

Queremos celebrar esse momento tão especial
ao lado das pessoas que fazem parte da nossa história.

Sua presença tornará esse dia ainda mais inesquecível.
`

};


/* =========================================
   ELEMENTOS
========================================= */

const surpriseScreen =
    document.getElementById("surpriseScreen");

const invitation =
    document.getElementById("invitation");

const openInvitation =
    document.getElementById("openInvitation");


/* =========================================
   CARREGAR CONFIGURAÇÕES
========================================= */

function loadConfig() {

    document.getElementById("babyName")
        .textContent = CONFIG.nome;

    document.getElementById("babyAge")
        .textContent = CONFIG.idade;

    document.getElementById("partyDate")
        .textContent = CONFIG.data;

    document.getElementById("partyDateHero")
        .textContent = CONFIG.data;

    document.getElementById("partyTime")
        .textContent = CONFIG.horario;

    document.getElementById("partyLocation")
        .textContent = CONFIG.local;

    document.getElementById("partyAddress")
        .textContent = CONFIG.endereco;

    document.getElementById("familyMessage")
        .textContent = CONFIG.mensagem;

    document.getElementById("mapsButton")
        .href = CONFIG.googleMaps;

}


/* =========================================
   ABRIR CONVITE
========================================= */

openInvitation.addEventListener(
    "click",
    () => {

        surpriseScreen.style.transition =
            "opacity 0.8s ease, transform 0.8s ease";

        surpriseScreen.style.opacity = "0";

        surpriseScreen.style.transform =
            "scale(1.05)";

        setTimeout(() => {

            surpriseScreen.classList.add("hidden");

            invitation.classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "instant"
            });

        }, 800);

    }
);


/* =========================================
   CONTAGEM REGRESSIVA
========================================= */

function updateCountdown() {

    const target =
        new Date(CONFIG.dataISO).getTime();

    const now =
        new Date().getTime();

    const difference =
        target - now;


    if (difference <= 0) {

        document
            .getElementById("countdown")
            .classList.add("hidden");

        document
            .getElementById("todayMessage")
            .classList.remove("hidden");

        return;
    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            (difference /
            (1000 * 60 * 60)) % 24
        );

    const minutes =
        Math.floor(
            (difference /
            (1000 * 60)) % 60
        );

    const seconds =
        Math.floor(
            (difference /
            1000) % 60
        );


    document.getElementById("days")
        .textContent = String(days).padStart(2, "0");

    document.getElementById("hours")
        .textContent = String(hours).padStart(2, "0");

    document.getElementById("minutes")
        .textContent = String(minutes).padStart(2, "0");

    document.getElementById("seconds")
        .textContent = String(seconds).padStart(2, "0");

}


setInterval(updateCountdown, 1000);

updateCountdown();


/* =========================================
   QUANTIDADE DE PESSOAS
========================================= */

const quantity =
    document.getElementById("peopleQuantity");

document
    .getElementById("increasePeople")
    .addEventListener("click", () => {

        let value =
            Number(quantity.value);

        if (value < 20) {
            quantity.value = value + 1;
        }

    });


document
    .getElementById("decreasePeople")
    .addEventListener("click", () => {

        let value =
            Number(quantity.value);

        if (value > 1) {
            quantity.value = value - 1;
        }

    });


/* =========================================
   CONFIRMAÇÃO
========================================= */

const confirmationForm =
    document.getElementById(
        "confirmationForm"
    );


confirmationForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            document.getElementById(
                "guestName"
            ).value.trim();

        const people =
            document.getElementById(
                "peopleQuantity"
            ).value;

        const status =
            document.querySelector(
                'input[name="status"]:checked'
            ).value;

        const observation =
            document.getElementById(
                "observation"
            ).value.trim();


        if (!name) {

            alert(
                "Digite o nome do convidado."
            );

            return;
        }

        const confirmation = {
            nome: name,
            quantidade_pessoas: Number(people),
            status,
            observacao: observation
        };

        const submitButton =
            confirmationForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

       const {
    error
} = await supabaseClient
    .from("confirmacoes")
    .insert(confirmation);

        if (error) {

            console.error(
                "Erro ao salvar confirmação:",
                error
            );

            alert(
                "Não foi possível enviar sua confirmação. Tente novamente."
            );

            submitButton.disabled = false;
            submitButton.textContent =
                "💗 Confirmar presença";

            return;
        }

        showConfirmationSuccess(data);
    }
);


/* =========================================
   SUCESSO
========================================= */

function showConfirmationSuccess(
    confirmation
) {

    confirmationForm
        .classList.add("hidden");


    document
        .getElementById(
            "confirmationSuccess"
        )
        .classList.remove("hidden");


    const statusText =
        confirmation.status === "confirmado"
            ? "Confirmamos nossa presença!"
            : "Não poderemos comparecer.";


    const message =
        `Olá! 💕\n\n` +
        `Confirmação do aniversário da ${CONFIG.nome}.\n\n` +
        `Nome: ${confirmation.nome}\n` +
        `Pessoas: ${confirmation.quantidade_pessoas}\n` +
        `Status: ${statusText}`;


    const whatsappURL =
        `https://wa.me/${CONFIG.whatsapp}` +
        `?text=${encodeURIComponent(message)}`;


    document
        .getElementById(
            "whatsappButton"
        )
        .href = whatsappURL;

}


/* =========================================
   GALERIA / LIGHTBOX
========================================= */

const lightbox =
    document.getElementById(
        "lightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );


document
    .querySelectorAll(".gallery-item img")
    .forEach((image) => {

        image.addEventListener(
            "click",
            () => {

                lightboxImage.src =
                    image.src;

                lightbox.classList
                    .remove("hidden");

            }
        );

    });


document
    .getElementById("closeLightbox")
    .addEventListener(
        "click",
        () => {

            lightbox.classList
                .add("hidden");

        }
    );


lightbox.addEventListener(
    "click",
    (event) => {

        if (event.target === lightbox) {

            lightbox.classList
                .add("hidden");

        }

    }
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

loadConfig();
