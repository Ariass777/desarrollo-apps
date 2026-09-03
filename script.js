const API_URL = "https://rickandmortyapi.com/api/episode";

async function obtenerEpisodios() {

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al consultar la API");
        }

        const datos = await respuesta.json();

        mostrarEpisodios(datos.results);

    } catch (error) {

        console.error(error);

        document.getElementById("episodios").innerHTML = `
            <p>No se pudieron cargar los episodios.</p>
        `;
    }
}


function mostrarEpisodios(episodios) {

    const contenedor = document.getElementById("episodios");

    contenedor.innerHTML = "";

    episodios.forEach(episodio => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("card");

        tarjeta.innerHTML = `
            <h2>${episodio.name}</h2>

            <p>
                <strong>Episodio:</strong>
                ${episodio.episode}
            </p>

            <p>
                <strong>Fecha:</strong>
                ${episodio.air_date}
            </p>

            <p>
                <strong>ID:</strong>
                ${episodio.id}
            </p>
        `;

        contenedor.appendChild(tarjeta);
    });
}


obtenerEpisodios();