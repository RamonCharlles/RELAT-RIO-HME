document.addEventListener('DOMContentLoaded', () => {
    const statusForm = document.getElementById('statusForm');
    const reportTable = document.getElementById('reportTable').getElementsByTagName('tbody')[0];
    const exportHistory = document.getElementById('exportHistory');
    let data = JSON.parse(localStorage.getItem('reportData')) || [];

    const tags = {
        'Carregadeiras LHD': ['CG01', 'CG03', 'CG04'],
        'Jumbos S2': ['JB01', 'JB02', 'JB04', 'JB05'],
        'Simba S7': ['SB01', 'SB02', 'SB03', 'SB04']
    };

    const frotaSelect = document.getElementById('frota');
    const tagSelect = document.getElementById('tag');

    frotaSelect.addEventListener('change', (event) => {
        const selectedFrota = event.target.value;
        tagSelect.innerHTML = '<option value="">Selecione uma tag</option>';

        if (tags[selectedFrota]) {
            tags[selectedFrota].forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagSelect.appendChild(option);
            });
        }
    });

    statusForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const frota = document.getElementById('frota').value;
        const tag = document.getElementById('tag').value;
        const initialStatus = document.getElementById('initialStatus').value;
        const finalStatus = document.getElementById('finalStatus').value || 'LIBERADO';
        const faultType = document.getElementById('faultType').value;
        const faultDescription = document.getElementById('faultDescription').value;
        const startTime = new Date(document.getElementById('startTime').value);
        const endTime = new Date(document.getElementById('endTime').value);
        const mecânico = document.getElementById('name').value || 'Nome do Mecânico';

        if (endTime < startTime) {
            alert('A data e hora de fim devem ser posteriores à data e hora de início.');
            return;
        }

        const duration = (endTime - startTime) / (1000 * 60 * 60); // Duração em horas

        data.push({ frota, tag, initialStatus, finalStatus, faultType, faultDescription, startTime, endTime, duration, mecânico });
        localStorage.setItem('reportData', JSON.stringify(data));
        updateReportTable();
        statusForm.reset();
    });

    function updateReportTable() {
        reportTable.innerHTML = '';
        data.forEach(entry => {
            const row = reportTable.insertRow();
            row.insertCell().textContent = entry.frota;
            row.insertCell().textContent = entry.tag;
            row.insertCell().textContent = entry.initialStatus;
            row.insertCell().textContent = entry.finalStatus;
            row.insertCell().textContent = entry.mecânico;
            row.insertCell().textContent = entry.faultDescription;
            row.insertCell().textContent = entry.faultType;
            row.insertCell().textContent = entry.startTime.toLocaleString();
            row.insertCell().textContent = entry.endTime.toLocaleString();
            row.insertCell().textContent = entry.duration.toFixed(2);
        });
    }

    document.getElementById('exportPDF').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text('Relatório de Equipamentos', 14, 10);

        const columns = ['Frota', 'Tag', 'Status Inicial', 'Status Final', 'Mecânico', 'Descrição do Serviço', 'Natureza da Falha', 'Data e Hora de Início', 'Data e Hora de Fim', 'Duração (Horas)'];
        const rows = [];

        Array.from(reportTable.rows).forEach(row => {
            const cells = Array.from(row.cells).map(cell => cell.textContent);
            rows.push(cells);
        });

        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 20
        });

        const fileName = `relatorio_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);

        const listItem = document.createElement('li');
        listItem.textContent = fileName;
        exportHistory.appendChild(listItem);
    });

    updateReportTable();
});
