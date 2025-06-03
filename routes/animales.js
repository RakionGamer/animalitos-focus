const axios = require('axios');
const cheerio = require('cheerio');
const imagenesLotto = require('./imagenesAnimalitos');

const busquedaAnimales = async () => {
  try {
    const response = await axios.get(
      'https://centrodeapuestaselrey.com.ve/resultados/lotto-activo',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (response.status !== 200) throw new Error('Error al obtener la página');

    const $ = cheerio.load(response.data);
    const resultados = [];

    const ahora = new Date();
    const venezuelaUTCOffset = -4 * 60;
    const localDate = new Date(ahora.getTime() + (venezuelaUTCOffset - ahora.getTimezoneOffset()) * 60000);
    const dia = String(localDate.getDate()).padStart(2, '0');
    const mes = String(localDate.getMonth() + 1).padStart(2, '0');
    const año = localDate.getFullYear();
    const fechaVenezuela = `${dia}-${mes}-${año}`;

    $('.lotery-result-list .thumbnail').each((i, el) => {
      const hora = $(el).find('.hora').text().trim();
      const animal = $(el).find('.text').text().trim();
      if (!animal || animal === '-') return;

      const imgSrc = $(el).find('img').attr('src') || '';
      const match = imgSrc.match(/\/(\d+)_/); 
      const numero = match ? match[1].padStart(2, '0') : '--';

      resultados.push({
        Hora: hora,
        Numero: numero,
        Animal: animal.toUpperCase(),
        ImagenURL: imagenesLotto[numero] ||  imgSrc,
        Fecha: fechaVenezuela,
      });
    });

    return resultados;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

module.exports = busquedaAnimales;