const token = localStorage.getItem("token");
const datosUsuario = localStorage.getItem("usuario");

if (!token || !datosUsuario) {
    window.location.replace("index.html");
} else {
    const usuario = JSON.parse(datosUsuario);
    if (usuario.tipoUsuario !== "admin") {
        window.location.replace("index.html");
    } 
}

const URL_API = "https://proyecto-production-7568.up.railway.app/api";
const URL_BACK = "https://proyecto-production-7568.up.railway.app";

const listaAlquileres = document.getElementById('listaAlquileres');
const listaVentas = document.getElementById('listaVentas');
const formObjeto = document.getElementById('formObjeto');

document.addEventListener('DOMContentLoaded', () => {
    getObjetos();
    getCitas();
});

async function getObjetos() {
    try {
        const res = await axios.get(`${URL_API}/objetos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        renderObjetos(res.data);
    } catch (e) { console.error(e); }
}

function renderObjetos(objetos) {
    listaAlquileres.innerHTML = "";
    listaVentas.innerHTML = "";

    objetos.forEach(obj => {
        let imagen = obj.imagen ? `${URL_BACK}/${obj.imagen}` : "img/sinimagen.png";
        const filaHTML = `
            <tr>
                <td>${obj.nombre}</td>
                <td><img src="${imagen}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;" onerror="this.src='img/sinimagen.png'"></td>
                <td><span class="badge bg-secondary">${obj.tipo}</span></td>
                <td>${obj.cantidad}</td>
                <td>${obj.precio}€</td>
                <td>${obj.estado || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick='editarObjeto(${JSON.stringify(obj)})'>Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarObjeto(${obj.id})">Borrar</button>
                </td>
            </tr>
        `;

        if (obj.tipo.toLowerCase() === 'alquiler') {
            listaAlquileres.innerHTML += filaHTML;
        } else {
            listaVentas.innerHTML += filaHTML;
        }
    });
}

function prepararNuevo() {
    formObjeto.reset();
    document.getElementById('objeto_id').value = "";
    document.getElementById('tituloModal').textContent = "Añadir Nuevo Objeto";
}

function editarObjeto(obj) {
    document.getElementById('objeto_id').value = obj.id;
    document.getElementById('tituloModal').textContent = "Editar Objeto";
    
    formObjeto.nombre.value = obj.nombre;
    formObjeto.tipo.value = obj.tipo;
    formObjeto.cantidad.value = obj.cantidad;
    formObjeto.precio.value = obj.precio;
    formObjeto.calificacion.value = obj.calificacion;
    formObjeto.estado.value = obj.estado || "";
    formObjeto.descuento.value = obj.descuento || 0;
    formObjeto.detalles.value = obj.detalles || "";
    
    const modal = new bootstrap.Modal(document.getElementById('modalObjeto'));
    modal.show();
}

formObjeto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('objeto_id').value;
    const formData = new FormData(formObjeto);
    
    let url = `${URL_API}/objetos`;
    if (id) {
        url = `${URL_API}/objetos/${id}`;
        formData.append('_method', 'PUT'); 
    }

    try {
        await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const modalElement = document.getElementById('modalObjeto');
        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modalInstance.hide();
        getObjetos();
    } catch (e) { console.error(e); }
});

async function eliminarObjeto(id) {
    if (!confirm("¿Borrar?")) return;
    try {
        await axios.delete(`${URL_API}/objetos/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        getObjetos();
    } catch (e) { console.error(e); }
}

const listaCitas = document.getElementById('listaCitas');

async function getCitas() {
    try {
        const res = await axios.get(`${URL_API}/citas`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        renderCitas(res.data);
    } catch (e) { console.error(e); }
}

function renderCitas(citas) {
    listaCitas.innerHTML = "";
    citas.forEach(cita => {
        const estadoTexto = cita.pendiente ? "Pendiente" : "Finalizada";
        const badgeColor = cita.pendiente ? "bg-warning text-dark" : "bg-success";
        const clienteId = cita.idCliente ? cita.idCliente : "No registrado";
        
        listaCitas.innerHTML += `
            <tr>
                <td>#${cita.id}</td>
                <td><span class="badge bg-light text-dark border">${clienteId}</span></td>
                <td>${cita.nombre}</td>
                <td>${cita.tipoConsulta}</td>
                <td>${cita.numMatricula}</td>
                <td><span class="badge ${badgeColor}">${estadoTexto}</span></td>
                <td>
                    <button class="btn btn-sm btn-info text-white" onclick='verCita(${JSON.stringify(cita)})'>Ver más</button>
                </td>
            </tr>
        `;
    });
}

function verCita(cita) {
    const contenedor = document.getElementById('detalleCitaContenido');
    document.getElementById('cita_id_finalizar').value = cita.id;
    
    const btnFinalizar = document.getElementById('btnFinalizarCita');
    btnFinalizar.style.display = cita.pendiente ? 'block' : 'none';

    contenedor.innerHTML = `
        <p><strong>ID Cliente:</strong> ${cita.idCliente || 'Sin cuenta'}</p>
        <p><strong>Cliente:</strong> ${cita.nombre}</p>
        <p><strong>Correo:</strong> ${cita.correo}</p>
        <p><strong>Teléfono:</strong> ${cita.telefono}</p>
        <p><strong>Matrícula:</strong> ${cita.numMatricula}</p>
        <p><strong>Bastidor/ID:</strong> ${cita.numIdC}</p>
        <p><strong>Tipo de Consulta:</strong> ${cita.tipoConsulta}</p>
        <p><strong>Información Adicional:</strong> ${cita.informacionAd || 'Ninguna'}</p>
        <p><strong>Fecha Creación:</strong> ${new Date(cita.created_at).toLocaleString()}</p>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalVerCita'));
    modal.show();
}

async function finalizarCita() {
    const id = document.getElementById('cita_id_finalizar').value;
    try {
        await axios.put(`${URL_API}/citas/${id}`, { pendiente: false }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalVerCita'));
        if (modalInstance) modalInstance.hide();
        getCitas();
    } catch (e) { console.error(e); }
}
