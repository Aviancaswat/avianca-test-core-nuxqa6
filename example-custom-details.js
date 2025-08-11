import { SCREENSHOTS_DETAILS } from "./helpers/avianca.helper";

export const setCustomsDetails = () => {
    setTimeout(() => {

        const screenShots = document.querySelectorAll("img.screenshot");

        screenShots.forEach((screen, index) => {

            const containerDetails = document.createElement("div");
            containerDetails.className = "screeshot-details";

            const titleDetailsHTML = document.createElement("strong");
            titleDetailsHTML.className = "screenshot-title";
            titleDetailsHTML.innerText = "Detalles del screeshot";
            const titleHTML = document.createElement("strong");
            titleHTML.innerHTML = `Paso ${index}: `;
            const descriptionHTML = document.createElement("strong");
            descriptionHTML.innerHTML = `Detalles: `;

            const titleText = document.createElement("span");
            titleText.innerHTML = SCREENSHOTS_DETAILS[index];
            const descriptionText = document.createElement("span");
            descriptionText.innerHTML = SCREENSHOTS_DETAILS[index];

            containerDetails.appendChild(titleDetailsHTML);
            containerDetails.appendChild(document.createElement("br"));
            containerDetails.appendChild(titleHTML);
            containerDetails.appendChild(titleText);
            containerDetails.appendChild(document.createElement("br"));
            containerDetails.appendChild(descriptionHTML);
            containerDetails.appendChild(descriptionText);

            screen.parentElement.parentElement.append(containerDetails);
        })
    }, 3000);
}