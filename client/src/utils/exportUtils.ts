import XLSX from 'xlsx-js-style';

/**
 * Utilidad profesional para exportar los horarios de los gestores a formato Excel (.xlsx).
 * Incluye estilos personalizados y formateo de celdas.
 */
export const exportToExcel = (data: any[], currentWeek: string) => {
    // Definición de estilo para la cabecera
    const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { fgColor: { rgb: "0F172A" } }, // Slate-900
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" }
        }
    };

    // Estilo para los nombres de escenarios
    const scenarioStyle = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "F1F5F9" } },
        alignment: { horizontal: "left" }
    };

    const rows: any[] = [];

    // Título del reporte
    rows.push([`REPORTE DE HORARIOS - SEMANA DEL ${currentWeek}`]);
    rows.push([]); // Espacio en blanco

    // Cabecera de la tabla
    const headers = ["ESCENARIO", "GESTOR", "CONTACTO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
    rows.push(headers);

    data.forEach(esc => {
        if (esc.gestores && esc.gestores.length > 0) {
            esc.gestores.forEach((g: any, idx: number) => {
                const row = [
                    idx === 0 ? esc.escenario : "", // Solo mostrar el nombre del escenario en la primera fila del grupo
                    g.nombre,
                    g.contacto || "",
                    ...g.turnos
                ];
                rows.push(row);
            });
            rows.push([]); // Fila vacía entre escenarios
        }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Aplicar anchos de columna automáticos rudimentarios
    const colWidths = [25, 30, 15, 12, 12, 12, 12, 12, 12, 12];
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

    // Aplicar estilos a la cabecera (fila 3, ya que 1 es título y 2 es espacio)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 2, c });
        if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Horarios");

    // Generar nombre de archivo profesional con fecha
    const fileName = `Horarios_Gestores_${currentWeek}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};
