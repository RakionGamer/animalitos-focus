const axios = require('axios');
const cheerio = require('cheerio');
const imagenesLotto = require('./imagenesAnimalitos');

const busquedaAnimales = async () => {
  try {
    const response = await axios.get(
      'https://www.lottoresultados.com/resultados/animalitos/lotto-activo',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (response.status !== 200) throw new Error('Error al obtener la página');

    const $ = cheerio.load(response.data);
    const resultados = [];

    // Obtener fecha del encabezado
    const fechaCompleta = $('h2 small').eq(1).text().trim();
    const [_, dia, mes, año] = fechaCompleta.match(/(\d{1,2}) de (\w+) de (\d{4})/) || [];

    const mesesES = {
      'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
      'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
      'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    };

    const mesNumero = mesesES[mes.toLowerCase()] || '00';
    const fechaNormalizada = `${dia.padStart(2, '0')}-${mesNumero}-${año}`;
    const contenedorPrincipal = $('#resultado-de-lotto-activo-de-hoy');
    contenedorPrincipal.find('.step-content-wrapper').each((index, element) => {
      const hora = $(element).find('h4').first().text().trim().toLowerCase();
      const texto = $(element).find('p.step-text').text().trim();

      if (['próximo', 'pendiente'].includes(texto.toLowerCase())) return;

      const [numeroRaw, ...animalParts] = texto.split(' ');
      const animal = animalParts.join(' ')
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      let numero;
      if (numeroRaw === '00') {
        numero = '00'; // Caso Ballena
      } else if (numeroRaw === '0' && animal === 'DELFIN') {
        numero = '0';  // Caso Delfín
      } else {
        numero = numeroRaw.padStart(2, '0'); // Demás números
      }

      
      resultados.push({
        Hora: hora.replace(/(am|pm)/, (match) => ` ${match.toUpperCase()}`),
        Numero: numero,
        Animal: animal,
        Fecha: fechaNormalizada,
        ImagenURL: imagenesLotto[numero] || $(element).find('img').attr('src')
      });
    });

    return resultados.filter(item => item.Numero);
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

module.exports = busquedaAnimales;