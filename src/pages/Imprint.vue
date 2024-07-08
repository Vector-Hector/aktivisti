<script setup lang="ts">
import { QPage, QScrollArea } from 'quasar'
</script>

<template>
  <QScrollArea class="flex flex-fill">
    <QPage>
      <div class="container">
        <br />
        <br />
        <h2>Partei Die Linke</h2>
        <p>
          Parteivorstand der Partei Die Linke<br />
          Kleine Alexanderstraße 28, 10178 Berlin<br />
          Telefon: (030) 24 009 397<br />
          <a href="mailto:bundesgeschaeftsstelle@die-linke.de" class="text-link"
            >bundesgeschaeftsstelle@die-linke.de</a
          ><br />
        </p>
        <h2>Technische Entwicklung</h2>
        <p>
          <b>control.alt.coop eG</b><br />
          Franz-Mehring-Platz 1, 10243 Berlin<br />
          <a href="https://control.alt.coop/" target="_blank"
            >control.alt.coop</a
          >
        </p>
        <h2>Hosting</h2>
        <p>
          <b>minuskel screen partner GmbH</b><br />
          Am Friedrichshain 22, 10407 Berlin<br />
          <a href="mailto:websupport@minuskel.de" class="text-link"
            >websupport@minuskel.de </a
          ><br />
          <a
            href="https://www.minuskel.de
"
            target="_blank"
            >https://www.minuskel.de
          </a>
        </p>
        <h2>Finanzamt</h2>
        <p>
          Die Partei Die Linke wird beim Finanzamt für Körperschaften I in
          Berlin unter der Steuernummer 27/650/52427 geführt.
        </p>

        <h2>Datenschutz</h2>
        <p>
          Die Partei Die Linke nimmt den Schutz Ihrer persönlichen Daten sehr
          ernst und hält sich strikt an die Regeln der Datenschutzgesetze.
          <a
            href="https://www.die-linke.de/seitenfuss/datenschutz/#accordion-heading-17445-2912"
            target="_blank"
            class="text-link"
          >
            weiterlesen
          </a>
        </p>
        <h2>Haftung</h2>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
          jedoch keine Gewähr übernehmen.
          <a
            href="https://www.die-linke.de/seitenfuss/impressum/haftungsausschluss/"
            target="_blank"
            class="text-link"
          >
            weiterlesen
          </a>
        </p>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0;
  font-size: 1.6rem;
}

.scroll-container {
  flex: 1;
  display: flex;
}
</style>
