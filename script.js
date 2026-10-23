let numerosDisponibles=[],pausado=false,jugando=false,tiempoEntreNumeros=5000,temporizador=null,intervaloAnimacion=null,vozActivada=true,numeroPendiente=null;
const $=id=>document.getElementById(id);
function numeroEnTexto(n){const u=['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];const e={10:'diez',11:'once',12:'doce',13:'trece',14:'catorce',15:'quince',16:'dieciséis',17:'diecisiete',18:'dieciocho',19:'diecinueve',20:'veinte',21:'veintiuno',22:'veintidós',23:'veintitrés',24:'veinticuatro',25:'veinticinco',26:'veintiséis',27:'veintisiete',28:'veintiocho',29:'veintinueve'};const d={30:'treinta',40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta',80:'ochenta',90:'noventa'};if(n<10)return u[n];if(e[n])return e[n];let t=Math.floor(n/10)*10;return n%10?`${d[t]} y ${u[n%10]}`:d[t]}
function actualizarEstado(){const estado=$('estadoSorteo');const texto=$('textoEstado');if(!estado||!texto)return;estado.classList.remove('estadoPausado','estadoFinalizado');if(!jugando){estado.classList.add('estadoFinalizado');texto.textContent='SORTEO FINALIZADO'}else if(pausado){estado.classList.add('estadoPausado');texto.textContent='SORTEO PAUSADO'}else{texto.textContent='SORTEO EN CURSO'}}
function crearNumeros(){numerosDisponibles=Array.from({length:90},(_,i)=>i+1)}
function crearTablero(){$('tablero').innerHTML='';for(let i=1;i<=90;i++){const el=document.createElement('div');el.textContent=i;el.id=`numero-${i}`;$('tablero').appendChild(el)}}
function cancelarTiempos(){clearTimeout(temporizador);temporizador=null;clearInterval(intervaloAnimacion);intervaloAnimacion=null;$('numeroActual').classList.remove('girando')}
// Frases tradicionales para números emblemáticos; el resto se canta normalmente.
const cantosClasicos = {
  1: 'El uno, el galán.',
  4: 'El cuatro, la cama.',
  6: 'El seis, el corazón.',
  7: 'El siete, la pipa.',
  8: 'El ocho, la dama.',
  9: 'El nueve, el zapato.',
  11: 'El once, las banderillas.',
  13: 'El trece, la mala pata.',
  15: 'El quince, la niña bonita.',
  22: 'El veintidós, los dos patitos.',
  24: 'El veinticuatro, Nochebuena.',
  25: 'El veinticinco, Navidad.',
  40: 'El cuarenta, el cura.',
  55: 'El cincuenta y cinco, los civiles.',
  60: 'El sesenta, la abuela.',
  69: 'El sesenta y nueve, el erótico.',
  77: 'El setenta y siete, las dos banderas.',
  90: 'El noventa, el abuelo.'
};

let vozEspanola = null;
function elegirVoz() {
  if (!('speechSynthesis' in window)) return null;
  const voces = speechSynthesis.getVoices();
  const espanolas = voces.filter(v => /^es(?:-|$)/i.test(v.lang));
  // Preferimos una voz española natural del sistema si existe.
  const preferidas = [/premium|enhanced|natural|neural/i, /m[oó]nica|paulina|luc[ií]a|jorge|helena|marisol/i];
  vozEspanola = espanolas.find(v => preferidas[0].test(v.name)) ||
    espanolas.find(v => /^es-ES$/i.test(v.lang) && preferidas[1].test(v.name)) ||
    espanolas.find(v => /^es-ES$/i.test(v.lang)) || espanolas[0] || null;
  return vozEspanola;
}
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', elegirVoz);
  elegirVoz();
}
function prepararVoz() {
  if (!('speechSynthesis' in window)) return;
  cancelarVoz();
  speechSynthesis.resume();
  elegirVoz();
  // Activación de voz desde el toque del usuario (importante en iPhone).
  const m = new SpeechSynthesisUtterance(' ');
  m.lang = 'es-ES';
  m.volume = 0;
  if (vozEspanola) m.voice = vozEspanola;
  speechSynthesis.speak(m);
}
function textoCantado(n) {
  const frases = cantosClasicos[n];
  return frases || numeroEnTexto(n);
}
// Se reproducen clips MP3 naturales si están disponibles.
// Si todavía no se han generado, se usa la voz del sistema como respaldo.
const reproductor = new Audio();
reproductor.preload = 'auto';
let vozSolicitud = 0;
let urlAudioActual = null;
function cancelarVoz(){
  vozSolicitud++;
  reproductor.pause();
  reproductor.removeAttribute('src');
  reproductor.load();
  if (urlAudioActual) { URL.revokeObjectURL(urlAudioActual); urlAudioActual = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function decirConSistema(n) {
  if (!vozActivada || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  speechSynthesis.resume();
  const m = new SpeechSynthesisUtterance(textoCantado(n));
  m.lang = 'es-ES';
  if (vozEspanola || elegirVoz()) m.voice = vozEspanola;
  m.rate = 0.96;
  m.pitch = 1;
  speechSynthesis.speak(m);
}
async function decirNumero(n) {
  cancelarVoz();
  if (!vozActivada) return;
  const solicitud = vozSolicitud;
  const ruta = `./audios/${String(n).padStart(2, '0')}.mp3`;
  try {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error('Audio no disponible');
    const blob = await respuesta.blob();
    if (!vozActivada || solicitud !== vozSolicitud) return;
    urlAudioActual = URL.createObjectURL(blob);
    reproductor.src = urlAudioActual;
    await reproductor.play();
  } catch (e) {
    if (vozActivada && solicitud === vozSolicitud) decirConSistema(n);
  }
}

function sacarNumero(){if(!jugando||pausado)return;if(numeroPendiente===null){if(!numerosDisponibles.length){finalizarBingo();return}const p=Math.floor(Math.random()*numerosDisponibles.length);numeroPendiente=numerosDisponibles.splice(p,1)[0]}animarBola(numeroPendiente)}
function animarBola(n){const bola=$('numeroActual');bola.classList.remove('animando','girando');void bola.offsetWidth;bola.classList.add('girando');let cambios=0;clearInterval(intervaloAnimacion);intervaloAnimacion=setInterval(()=>{if(!jugando||pausado){clearInterval(intervaloAnimacion);intervaloAnimacion=null;return}bola.textContent=Math.floor(Math.random()*90)+1;if(++cambios>=12){clearInterval(intervaloAnimacion);intervaloAnimacion=null;bola.textContent=n;$('numeroTexto').textContent=numeroEnTexto(n).toUpperCase();bola.classList.remove('girando');bola.classList.add('animando');$(`numero-${n}`).classList.add('salido');const el=document.createElement('div');el.className='ultimoNumero';el.textContent=n;const placeholder=$('listaUltimosNumeros').querySelector('.placeholderUltimos');if(placeholder)placeholder.remove();$('listaUltimosNumeros').prepend(el);if($('listaUltimosNumeros').children.length>5)$('listaUltimosNumeros').lastChild.remove();$('contador').textContent=`Quedan ${numerosDisponibles.length} números`;numeroPendiente=null;decirNumero(n);if(!numerosDisponibles.length){finalizarBingo();return}programarSiguienteNumero()}},80)}
function programarSiguienteNumero(){clearTimeout(temporizador);temporizador=null;if(jugando&&!pausado)temporizador=setTimeout(()=>{temporizador=null;sacarNumero()},tiempoEntreNumeros)}
function finalizarBingo(){jugando=false;actualizarEstado();clearTimeout(temporizador);temporizador=null;$('numeroTexto').textContent='¡BINGO!';$('contador').textContent='Han salido los 90 números'}
function iniciarBingo(){cancelarTiempos();cancelarVoz();crearNumeros();crearTablero();numeroPendiente=null;pausado=false;jugando=true;actualizarEstado();$('pausar').textContent='⏸ PAUSAR';$('numeroActual').textContent='—';$('numeroTexto').textContent='';$('listaUltimosNumeros').innerHTML='';$('contador').textContent='Quedan 90 números';sacarNumero()}
$('empezar').addEventListener('click',()=>{$('pantallaInicio').classList.add('oculto');$('juego').classList.remove('oculto');$('juego').classList.add('entradaJuego');prepararVoz();iniciarBingo()});
$('pausar').addEventListener('click',function(){if(!jugando)return;pausado=!pausado;actualizarEstado();if(pausado){cancelarTiempos();cancelarVoz();this.textContent='▶ CONTINUAR'}else{this.textContent='⏸ PAUSAR';if(numeroPendiente!==null)sacarNumero();else programarSiguienteNumero()}});
$('reiniciar').addEventListener('click',()=>{prepararVoz();iniciarBingo()});
$('velocidad').addEventListener('change',function(){tiempoEntreNumeros=Number(this.value);if(jugando&&!pausado&&numeroPendiente===null)programarSiguienteNumero()});
$('voz').addEventListener('click',function(){vozActivada=!vozActivada;this.textContent=vozActivada?'🔊':'🔇';this.classList.toggle('vozOff',!vozActivada);if(vozActivada)prepararVoz();else cancelarVoz()});
$('volverInicio').addEventListener('click',()=>{cancelarTiempos();cancelarVoz();jugando=false;pausado=true;numeroPendiente=null;actualizarEstado();$('juego').classList.add('oculto');$('pantallaInicio').classList.remove('oculto')});
crearNumeros();crearTablero();
