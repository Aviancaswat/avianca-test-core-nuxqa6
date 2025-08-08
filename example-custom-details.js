export const setCustomsDetails = () => {
    setTimeout(() => {

        const screenShots = document.querySelectorAll("img.screenshot");

        screenShots.forEach((screen, index) => {
            const containerDetails = document.createElement("div");
            containerDetails.className = "screeshot-details";

            // Creación de título y descripción
            const titleHTML = document.createElement("strong");
            titleHTML.innerHTML = `Paso ${index}: `;
            const descriptionHTML = document.createElement("strong");
            descriptionHTML.innerHTML = `Detalles: `;

            // Creación de texto para los detalles
            const titleText = document.createElement("span");
            titleText.innerHTML = `Titulo del paso que se ejecutó`;
            const descriptionText = document.createElement("span");
            descriptionText.innerHTML = `Detalles del paso que se ejecutó`;

            // Anexamos los elementos a containerDetails
            containerDetails.appendChild(titleHTML);
            containerDetails.appendChild(titleText);
            containerDetails.appendChild(document.createElement("br"));
            containerDetails.appendChild(descriptionHTML);
            containerDetails.appendChild(descriptionText);

            // Insertamos el containerDetails después de la imagen
            screen.parentElement.parentElement.append(containerDetails);
        })
    }, 3500);
}
