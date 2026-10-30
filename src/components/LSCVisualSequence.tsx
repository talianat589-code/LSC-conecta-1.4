
import { useEffect, useState } from "react";
import type { SegmentoFraseLSC } from "../data/lscPhrasePlanner";

type Props = {
  segmentos: SegmentoFraseLSC[];
};

export default function LSCVisualSequence({ segmentos }: Props) {
  const [indice, setIndice] = useState(0);
  const [auto, setAuto] = useState(false);
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    setIndice(0);
    setAuto(false);
  }, [segmentos]);

  const posicion =
    segmentos.length > 0
      ? Math.min(indice, segmentos.length - 1)
      : 0;

  const actual = segmentos[posicion];
  const sena = actual?.sena;

  const video = sena?.video;
  const imagen = sena?.imagen;
  const animacion = sena?.animacion;

  const avanzar = () => {
    setIndice((anterior) =>
      Math.min(segmentos.length - 1, anterior + 1)
    );
  };

  const retroceder = () => {
    setIndice((anterior) => Math.max(0, anterior - 1));
  };

  useEffect(() => {
    if (!auto || !actual || video) return;

    const temporizador = window.setTimeout(() => {
      setIndice((anterior) => {
        if (anterior >= segmentos.length - 1) {
          setAuto(false);
          return anterior;
        }

        return anterior + 1;
      });
    }, segundos * 1000);

    return () => window.clearTimeout(temporizador);
  }, [auto, indice, segmentos.length, video, segundos, actual]);

  const alTerminarVideo = () => {
    if (!auto) return;

    if (posicion < segmentos.length - 1) {
      avanzar();
    } else {
      setAuto(false);
    }
  };

  if (segmentos.length === 0) {
    return (
      <section className="lsc-sequence">
        <h3>Secuencia visual de señas</h3>
        <p>
          Habla para organizar la frase y consultar los
          conceptos disponibles en la biblioteca LSC.
        </p>
      </section>
    );
  }

  return (
    <section className="lsc-sequence">
      <div className="lsc-sequence-header">
        <div>
          <h3>Secuencia visual de la frase</h3>
          <p>
            Los elementos se muestran en el orden de la frase
            reconocida.
          </p>
        </div>

        <span className="lsc-sequence-count">
          {posicion + 1} de {segmentos.length}
        </span>
      </div>

      <div className="lsc-sequence-progress">
        <div
          className="lsc-sequence-progress-fill"
          style={{
            width: `${((posicion + 1) / segmentos.length) * 100}%`,
          }}
        />
      </div>

      <div className="lsc-sequence-card">
        <span className="lsc-sequence-label">
          ELEMENTO {posicion + 1}
        </span>

        <h4>{sena?.concepto ?? actual.texto}</h4>

        {sena ? (
          <>
            {video ? (
              <video
                key={String(video)}
                className="lsc-sequence-media"
                src={video}
                controls
                playsInline
                preload="metadata"
                onEnded={alTerminarVideo}
              >
                Tu navegador no puede reproducir este video.
              </video>
            ) : animacion ? (
              <img
                className="lsc-sequence-media"
                src={animacion}
                alt={`Animación de ${sena.concepto}`}
              />
            ) : imagen ? (
              <img
                className="lsc-sequence-media"
                src={imagen}
                alt={`Imagen de la seña: ${sena.concepto}`}
              />
            ) : (
              <div className="lsc-sequence-empty">
                <span aria-hidden="true">🤟</span>
                <p>
                  El concepto existe en la biblioteca, pero
                  todavía no tiene un recurso visual.
                </p>
              </div>
            )}

            {sena.estado === "pendiente-validacion" && (
              <p className="lsc-sequence-warning">
                Concepto pendiente de validación lingüística.
              </p>
            )}
          </>
        ) : (
          <div className="lsc-sequence-empty">
            <span aria-hidden="true">🔎</span>
            <p>
              Esta palabra no tiene una coincidencia exacta
              en la biblioteca actual. No se inventará una seña.
            </p>
          </div>
        )}

        <div className="lsc-sequence-dots">
          {segmentos.map((segmento, i) => (
            <button
              key={`${segmento.texto}-${i}`}
              type="button"
              className={
                i === posicion
                  ? "lsc-sequence-dot active"
                  : "lsc-sequence-dot"
              }
              onClick={() => setIndice(i)}
              aria-label={`Ver elemento ${i + 1}: ${segmento.texto}`}
              aria-current={i === posicion ? "step" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="lsc-sequence-settings">
        <label htmlFor="lsc-sequence-seconds">
          Tiempo por elemento
        </label>

        <select
          id="lsc-sequence-seconds"
          value={segundos}
          onChange={(evento) =>
            setSegundos(Number(evento.target.value))
          }
        >
          <option value={3}>3 segundos</option>
          <option value={5}>5 segundos</option>
          <option value={8}>8 segundos</option>
          <option value={10}>10 segundos</option>
        </select>
      </div>

      <div className="lsc-sequence-controls">
        <button
          type="button"
          onClick={retroceder}
          disabled={posicion === 0}
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={() => setAuto((estado) => !estado)}
          aria-pressed={auto}
        >
          {auto ? "Detener automático" : "Reproducir secuencia"}
        </button>

        <button
          type="button"
          onClick={avanzar}
          disabled={posicion === segmentos.length - 1}
        >
          Siguiente
        </button>
      </div>

      <p className="lsc-sequence-status">
        {auto
          ? video
            ? "La secuencia avanzará al terminar el video."
            : `Avance automático cada ${segundos} segundos.`
          : "Modo manual. Avanza cuando estés listo."}
      </p>
    </section>
  );
}
