export const normalize = (str: string): string => {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "")
        .replace(/cancha|placa/g, "")
        .trim();
};
